package org.hackbrooklyn.plaza.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;
import org.hackbrooklyn.plaza.model.TeamFormationTeam;

import java.util.Collection;

@Data
@RequiredArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TeamFormationTeamSearchDTO extends PaginatedResponse {

    public TeamFormationTeamSearchDTO(int pages, Collection<TeamFormationTeam> teams, long totalFoundTeams) {
        super(pages);
        this.teams = teams;
        this.totalFoundTeams = totalFoundTeams;
    }

    private Collection<TeamFormationTeam> teams;
    private long totalFoundTeams;
}
