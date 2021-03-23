package org.hackbrooklyn.plaza.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;

@Component
public class AwsS3Utils {

    @Value("${AWS_S3_BUCKET}")
    private String AWS_S3_BUCKET;

    private final S3Client s3Client;

    @Autowired
    public AwsS3Utils(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Uploads a file from a multipart form to an AWS S3 bucket.
     *
     * @param file      The multipart file to upload to the S3 bucket.
     * @param uploadDir The directory on the S3 bucket to upload the file to.
     * @return The uploaded object's key.
     */
    public String uploadFormFileToAwsS3(MultipartFile file, String uploadDir) throws IOException {
        // Clean resume file name by converting spaces to underscores and generating a unique file name.
        String cleanedResumeFileName = Objects.requireNonNull(file.getOriginalFilename()).replaceAll(" ", "_");
        String uploadedFileName = UUID.randomUUID() + "_" + cleanedResumeFileName;

        // Upload resume to bucket
        String key = Paths.get(uploadDir, uploadedFileName).toString();
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(AWS_S3_BUCKET)
                .key(key)
                .build();
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        return key;
    }
}
