package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDataDTO {
    private int id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
