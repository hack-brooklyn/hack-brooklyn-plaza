package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
public class CreateTFParticipantAndTeamDTO {

    @NotNull
    private CreateTFParticipantDTO participant;

    @NotNull
    private CreateTFTeamDTO team;
}
