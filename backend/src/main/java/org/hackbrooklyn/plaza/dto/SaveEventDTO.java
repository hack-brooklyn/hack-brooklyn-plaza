package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class SaveEventDTO {

    @NotBlank
    private String title;

    private List<@NotBlank String> presenters;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @NotBlank
    private String description;

    @URL
    private String externalLink;
}
