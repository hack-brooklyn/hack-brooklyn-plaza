package org.hackbrooklyn.plaza.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import org.hackbrooklyn.plaza.model.TeamFormationTeamJoinRequest;

import java.util.Collection;

@Data
@RequiredArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TeamFormationTeamInboxDTO extends PaginatedResponse {

    public TeamFormationTeamInboxDTO(int pages, Collection<TeamFormationTeamJoinRequest> joinRequests, long totalFoundJoinRequests) {
        super(pages);
        this.joinRequests = joinRequests;
        this.totalFoundJoinRequests = totalFoundJoinRequests;
    }

    private Collection<TeamFormationTeamJoinRequest> joinRequests;
    private long totalFoundJoinRequests;
}
