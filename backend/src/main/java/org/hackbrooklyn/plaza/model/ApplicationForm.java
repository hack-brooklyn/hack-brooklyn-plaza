package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.validator.constraints.Range;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.*;
import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "applications")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationForm {

    // Internal data
    @Id
    @Column(name = "application_number")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private int applicationNumber;

    @Column(name = "user_id")
    @NotNull
    @JsonIgnore
    private UUID userId;

    @Column(name = "application_timestamp")
    @CreationTimestamp
    @JsonIgnore
    private LocalDateTime applicationTimestamp;

    // Part 1
    @Column(name = "first_name")
    @NotEmpty
    private String firstName;

    @Column(name = "last_name")
    @NotEmpty
    private String lastName;

    @Column(name = "email")
    @NotEmpty
    private String email;

    @Column(name = "country")
    @NotEmpty
    private String country;

    @Column(name = "gender")
    private String gender;

    @Column(name = "pronouns")
    private String pronouns;

    @Column(name = "ethnicity")
    private String ethnicity;

    @Column(name = "shirt_size")
    private String shirtSize;

    @Column(name = "is_first_hackathon")
    private boolean isFirstHackathon;

    @Column(name = "number_hackathons_attended")
    private int numberHackathonsAttended;

    // Part 2
    @Column(name = "school")
    @NotEmpty
    private String school;

    @Column(name = "level_of_study")
    @NotEmpty
    private String levelOfStudy;

    @Column(name = "graduation_year")
    @Range(min = 1900, max = 2100)
    @NotNull
    private int graduationYear;

    @Column(name = "major")
    private String major;

    // Part 3
    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    // Resume data used depends on the current context
    // Uploaded resume file for the application form only
    // The resume file itself is not saved in the database
    @Transient
    @JsonInclude
    private MultipartFile resumeFile;

    // Resume data on AWS S3
    @Column(name = "resume_file_name_s3")
    @JsonIgnore
    private String resumeFileNameS3;

    @Column(name = "resume_key_s3")
    @JsonIgnore
    private String resumeKeyS3;

    @Column(name = "resume_url_s3")
    @JsonIgnore
    private String resumeUrlS3;

    // Part 4
    @Column(name = "short_response_one")
    private String shortResponseOne;

    @Column(name = "short_response_two")
    private String shortResponseTwo;

    @Column(name = "short_response_three")
    private String shortResponseThree;

    // Agreements
    @Column(name = "accept_toc_and_coc")
    @NotNull
    @AssertTrue
    private boolean acceptTocAndCoc;

    @Column(name = "share_resume_with_sponsors")
    private boolean shareResumeWithSponsors;
}
