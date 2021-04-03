package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.hackbrooklyn.plaza.model.TeamFormationParticipant;

import java.util.Collection;

@Data
@AllArgsConstructor
public class TeamFormationParticipantSearchResponse {

    private Collection<TeamFormationParticipant> participants;
    private int pages;
    private long totalFoundParticipants;
}
