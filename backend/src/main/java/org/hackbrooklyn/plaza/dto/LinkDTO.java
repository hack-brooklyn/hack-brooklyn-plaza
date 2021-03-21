package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import javax.validation.constraints.NotBlank;

@Data
@AllArgsConstructor
public class LinkDTO {

    @URL
    @NotBlank
    private String link;
}
