package org.hackbrooklyn.plaza.model;

import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Stores the password reset keys for resetting user passwords.
 */
@Entity
@Data
@Table(name = "password_resets")
public class PasswordReset {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "password_reset_key")
    @NotBlank
    private String passwordResetKey;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resetting_user", referencedColumnName = "id")
    @NotNull
    private User resettingUser;

    @Column(name = "key_expiry_timestamp")
    @NotNull
    private LocalDateTime keyExpiryTimestamp;
}
