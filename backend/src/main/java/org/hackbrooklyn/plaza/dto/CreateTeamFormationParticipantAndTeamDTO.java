package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
public class CreateTeamFormationParticipantAndTeamDTO {

    @NotNull
    private TeamFormationParticipantFormDataDTO participant;

    @NotNull
    private TeamFormationTeamFormDataDTO team;
}
