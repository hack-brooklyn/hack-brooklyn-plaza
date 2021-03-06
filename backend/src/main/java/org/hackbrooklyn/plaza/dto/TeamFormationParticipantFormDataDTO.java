package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Set;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class TeamFormationParticipantFormDataDTO {

    @NotNull
    @Size(min = 1, max = 5)
    private Set<String> interestedTopicsAndSkills;

    @NotBlank
    private String specialization;

    @NotBlank
    private String objectiveStatement;

    @NotBlank
    private String contactInfo;
}
