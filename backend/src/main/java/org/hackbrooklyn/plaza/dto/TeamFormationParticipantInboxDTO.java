package org.hackbrooklyn.plaza.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import org.hackbrooklyn.plaza.model.TeamFormationParticipantInvitation;

import java.util.Collection;

@Data
@RequiredArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TeamFormationParticipantInboxDTO extends PaginatedResponse {

    public TeamFormationParticipantInboxDTO(int pages, Collection<TeamFormationParticipantInvitation> invitations, long totalFoundInvitations) {
        super(pages);
        this.invitations = invitations;
        this.totalFoundInvitations = totalFoundInvitations;
    }

    private Collection<TeamFormationParticipantInvitation> invitations;
    private long totalFoundInvitations;
}
