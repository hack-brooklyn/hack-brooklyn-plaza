package org.hackbrooklyn.plaza.service;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDataResponse {
    private int userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
