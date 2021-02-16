package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.Range;
import org.hibernate.validator.constraints.URL;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * Represents an application from a previous iteration of the hackathon.
 */
@Entity
@Data
@Table(name = "previous_submitted_applications")
public class PreviousSubmittedApplication {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "first_name")
    @NotBlank
    private String firstName;

    @Column(name = "last_name")
    @NotBlank
    private String lastName;

    @Column(name = "email", unique = true)
    @Email
    private String email;

    @Column(name = "school_email", unique = true)
    @Email
    private String schoolEmail;

    @Column(name = "emplid", unique = true)
    @NotBlank
    private String emplid;

    @Column(name = "school")
    @NotBlank
    private String school;

    @Column(name = "gender")
    private String gender;

    @Column(name = "pronouns")
    private String pronouns;

    @Column(name = "race")
    private String race;

    @Column(name = "academic_standing")
    private String academicStanding;

    @Column(name = "graduation_year")
    @Range(min = 1900, max = 2100)
    @NotNull
    private int graduationYear;

    @Column(name = "major")
    @NotEmpty
    private String major;

    @Column(name = "has_attended_hackathon_before")
    @NotNull
    private boolean hasAttendedHackathonBefore;

    @Column(name = "num_hackathons_attended")
    @Min(0)
    private int numHackathonsAttended;

    @Column(name = "github_url")
    @URL
    private String githubUrl;

    @Column(name = "linkedin_url")
    @URL
    private String linkedinUrl;

    @Column(name = "website_url")
    @URL
    private String websiteUrl;

    @Column(name = "uploaded_resume_url")
    @URL
    private String uploadedResumeUrl;

    @Column(name = "share_info_with_recruiters")
    private boolean shareInfoWithRecruiters;

    @Column(name = "shirt_size")
    private String shirtSize;

    @Column(name = "dietary_restrictions")
    private String dietaryRestrictions;

    @Column(name = "short_response_one", columnDefinition = "TEXT")
    private String shortResponseOne;

    @Column(name = "short_response_two", columnDefinition = "TEXT")
    private String shortResponseTwo;

    @Column(name = "referral_source")
    private String referralSource;

    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    @Column(name = "submit_date_time")
    @CreationTimestamp
    @JsonIgnore
    private LocalDateTime submitDateTime;
}
