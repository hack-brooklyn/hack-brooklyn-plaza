package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import javax.validation.constraints.*;
import java.util.Set;

@Data
@AllArgsConstructor
public class CreateTeamFormationTeamDTO {

    @NotBlank
    private String name;

    @NotNull
    @Size(min = 1, max = 5)
    private Set<String> interestedTopicsAndSkills;

    @NotBlank
    private String objectiveStatement;

    @NotNull
    @Min(2)
    @Max(4)
    private int size;
}
