package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SaveEventDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String presenters;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @NotBlank
    private String description;

    @NotBlank
    private String externalLink;
}
