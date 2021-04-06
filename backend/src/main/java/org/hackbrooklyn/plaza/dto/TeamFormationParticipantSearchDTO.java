package org.hackbrooklyn.plaza.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import org.hackbrooklyn.plaza.model.TeamFormationParticipant;

import java.util.Collection;

@Data
@RequiredArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TeamFormationParticipantSearchDTO extends PaginatedResponse {

    public TeamFormationParticipantSearchDTO(int pages, Collection<TeamFormationParticipant> participants, long totalFoundParticipants) {
        super(pages);
        this.participants = participants;
        this.totalFoundParticipants = totalFoundParticipants;
    }

    private Collection<TeamFormationParticipant> participants;
    private long totalFoundParticipants;

}
