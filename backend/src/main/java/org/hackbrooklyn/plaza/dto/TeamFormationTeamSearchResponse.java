package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.hackbrooklyn.plaza.model.TeamFormationTeam;

import java.util.Collection;

@Data
@AllArgsConstructor
public class TeamFormationTeamSearchResponse {

    private Collection<TeamFormationTeam> teams;
    private int pages;
    private long totalFoundTeams;
}
