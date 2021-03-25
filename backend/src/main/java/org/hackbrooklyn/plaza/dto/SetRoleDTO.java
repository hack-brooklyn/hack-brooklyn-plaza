package org.hackbrooklyn.plaza.dto;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class SetRoleDTO {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String role;
}
