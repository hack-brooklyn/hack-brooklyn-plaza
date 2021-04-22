package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import javax.validation.constraints.NotEmpty;

@Data
@AllArgsConstructor
public class ChecklistLinksDTO {

    @URL
    @NotEmpty
    private String discordUrl;

    @URL
    @NotEmpty
    private String devpostUrl;

    @URL
    @NotEmpty
    private String guideUrl;
}
