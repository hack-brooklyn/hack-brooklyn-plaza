package org.hackbrooklyn.plaza.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hackbrooklyn.plaza.PlazaApplication;
import org.hackbrooklyn.plaza.model.ApplicationForm;
import org.hackbrooklyn.plaza.repository.ApplicationFormRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.validation.ValidationException;
import java.net.URL;
import java.util.Objects;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/applicationForm")
public class ApplicationFormController {

    @Value("${AWS_S3_BUCKET}")
    private String AWS_S3_BUCKET;

    static final Logger logger = LoggerFactory.getLogger(PlazaApplication.class);

    private final ApplicationFormRepository applicationFormRepository;

    @Autowired
    public ApplicationFormController(ApplicationFormRepository applicationFormRepository) {
        this.applicationFormRepository = applicationFormRepository;
    }

    // AWS Client
    private static final S3Client s3 = S3Client.builder().region(Region.US_EAST_1).build();

    @PostMapping
    public ResponseEntity<Void> processApplication(@ModelAttribute ApplicationFormRequest applicationFormRequest) {
        // Parse JSON from data
        ApplicationForm applicationForm;
        try {
            applicationForm = new ObjectMapper().readValue(applicationFormRequest.getFormDataJson(), ApplicationForm.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        logger.info(String.format("New application received from %s %s.", applicationForm.getFirstName(), applicationForm.getLastName()));

        // Generate random user ID
        UUID userId = UUID.randomUUID();
        applicationForm.setUserId(userId);

        logger.info(AWS_S3_BUCKET);

        // Upload resume to AWS S3 if one was submitted and retrieve file URL
        if (applicationFormRequest.getResumeFile() != null) {
            try {
                MultipartFile resumeFile = applicationFormRequest.getResumeFile();

                logger.info("Uploading submitted resume to AWS S3...");
                logger.info("Original resume file name: " + resumeFile.getOriginalFilename());

                // Convert spaces to underscores in file name
                String cleanedResumeFileName = Objects.requireNonNull(resumeFile.getOriginalFilename()).replaceAll(" ", "_");

                // The resume's file name on S3, prefixed with the user's user ID
                // Format: "<User ID>-<Original File Name>.<Extension>"
                String cleanedResumeFileNameWithUserId = userId.toString() + "-" + cleanedResumeFileName;
                applicationForm.setResumeFileNameS3(cleanedResumeFileNameWithUserId);

                // The path to the resume on S3
                String key = "resumes/" + cleanedResumeFileNameWithUserId;
                applicationForm.setResumeKeyS3(key);

                // Upload resume to bucket
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(AWS_S3_BUCKET)
                        .key(key)
                        .build();

                s3.putObject(putObjectRequest, RequestBody.fromBytes(resumeFile.getBytes()));

                // Get uploaded resume URL
                S3Utilities s3Utils = s3.utilities();
                GetUrlRequest urlRequest = GetUrlRequest.builder()
                        .bucket(AWS_S3_BUCKET)
                        .key(key)
                        .build();
                URL resumeUrl = s3Utils.getUrl(urlRequest);
                logger.info("Uploaded resume to S3 at " + resumeUrl.toString());

                // Store resume URL
                applicationForm.setResumeUrlS3(resumeUrl.toString());
            } catch (Exception e) {
                logger.error("Could not upload resume to AWS S3!");
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
            }
        }

        // Save application form in database
        try {
            applicationFormRepository.save(applicationForm);
        } catch (ValidationException e) {
            e.printStackTrace();
            logger.error("Form data failed validation.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        logger.info("Successfully saved application form to database.");
        return ResponseEntity.ok().build();
    }

    @RequiredArgsConstructor
    @Getter
    private static class ApplicationFormRequest {
        private final MultipartFile resumeFile;
        private final String formDataJson;
    }
}
