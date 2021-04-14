package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.URL;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class SubscribeToPushNotificationDTO {

    @URL
    @NotBlank
    @NotNull
    private String endpoint;

    @NotBlank
    @NotNull
    private String key;

    @NotBlank
    @NotNull
    private String auth;
}
