package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * Represents an applicant that registered their interest before priority applications closed.
 */
@Entity
@Data
@Table(name = "registered_interest_applicants")
public class RegisteredInterestApplicant {

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

    @Column(name = "register_date_time")
    @CreationTimestamp
    @JsonIgnore
    private LocalDateTime registerDateTime;
}
