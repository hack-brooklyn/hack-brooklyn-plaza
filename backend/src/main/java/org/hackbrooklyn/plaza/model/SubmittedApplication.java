package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.Range;
import org.hibernate.validator.constraints.URL;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Represents a submitted application for the hackathon.
 */
@Entity
@Data
@Table(name = "applications")
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubmittedApplication {

    // Internal data
    @Id
    @Column(name = "application_number")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private int applicationNumber;

    @Column(name = "application_timestamp")
    @CreationTimestamp
    @JsonIgnore
    private LocalDateTime applicationTimestamp;

    // Part 1
    @Column(name = "first_name")
    @NotBlank
    private String firstName;

    @Column(name = "last_name")
    @NotBlank
    private String lastName;

    @Column(name = "email")
    @NotBlank
    @Email
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
    @Min(0)
    private int numberHackathonsAttended;

    // Part 2
    @Column(name = "school")
    @NotBlank
    private String school;

    @Column(name = "level_of_study")
    @NotBlank
    private String levelOfStudy;

    @Column(name = "graduation_year")
    @Range(min = 1900, max = 2100)
    @NotNull
    private int graduationYear;

    @Column(name = "major")
    private String major;

    // Part 3
    @Column(name = "github_url")
    @URL(message = "must be a valid URL starting with http:// or https://")
    private String githubUrl;

    @Column(name = "linkedin_url")
    @URL(message = "must be a valid URL starting with http:// or https://")
    private String linkedinUrl;

    @Column(name = "website_url")
    @URL(message = "must be a valid URL starting with http:// or https://")
    private String websiteUrl;

    // Uploaded resume file is for the application form only
    // The resume file itself is not saved in the database
    @Transient
    private MultipartFile resumeFile;

    @Column(name = "resume_key_s3")
    @JsonIgnore
    private String resumeKeyS3;

    // Part 4
    @Column(name = "short_response_one")
    private String shortResponseOne;

    @Column(name = "short_response_two")
    private String shortResponseTwo;

    @Column(name = "short_response_three")
    private String shortResponseThree;

    // Agreements
    // We don't store whether or not the user accepted the terms/code of conduct since they would have to
    // accept it to submit the application in the first place.
    @Transient
    @NotNull
    @AssertTrue
    private boolean acceptTocAndCoc;

    @Column(name = "share_resume_with_sponsors")
    private boolean shareResumeWithSponsors;

    @Column(name = "priority_applicant")
    @NotNull
    @JsonIgnore
    private boolean priorityApplicant;

    @Column(name = "priority_applicant_email")
    @Email
    private String priorityApplicantEmail;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_application_id", referencedColumnName = "id")
    @JsonIgnore
    private PreviousSubmittedApplication previousApplication;

    @Column(name = "registered_interest")
    @NotNull
    @JsonIgnore
    private boolean registeredInterest;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_interest_applicant_id", referencedColumnName = "id")
    @JsonIgnore
    private RegisteredInterestApplicant registeredInterestApplicant;
}
