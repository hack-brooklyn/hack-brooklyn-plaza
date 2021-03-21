package org.hackbrooklyn.plaza.model;

import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Stores the activation keys for activating users.
 */
@Entity
@Data
@Table(name = "user_activations")
public class UserActivation {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "activation_key", unique = true)
    @NotBlank
    private String activationKey;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "activating_application", referencedColumnName = "application_number")
    @NotNull
    private SubmittedApplication activatingApplication;

    @Column(name = "key_expiry_timestamp")
    @NotNull
    private LocalDateTime keyExpiryTimestamp;
}
