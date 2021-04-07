package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hackbrooklyn.plaza.security.Roles;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Collection;

/**
 * Represents an activated user account.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@RequiredArgsConstructor
public class User implements UserDetails {

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
    @NotBlank
    @Email
    private String email;

    @Column(name = "hashed_password", unique = true)
    @NotBlank
    @JsonIgnore
    private String hashedPassword;

    @Column(name = "role")
    @NotBlank
    private String role;

    @Column(name = "activation_timestamp")
    @CreationTimestamp
    private LocalDateTime activationTimestamp;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_application", referencedColumnName = "application_number", unique = true)
    private SubmittedApplication linkedApplication;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Roles.getGrantedAuthoritiesForRole(this.role);
    }

    @Override
    public String getPassword() {
        return this.hashedPassword;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
