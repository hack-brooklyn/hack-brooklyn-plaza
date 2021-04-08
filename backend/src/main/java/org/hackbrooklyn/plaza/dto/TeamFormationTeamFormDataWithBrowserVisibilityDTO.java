package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.*;
import java.util.Set;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class TeamFormationTeamFormDataWithBrowserVisibilityDTO extends TeamFormationTeamFormDataDTO {

    public TeamFormationTeamFormDataWithBrowserVisibilityDTO(@NotBlank String name, @NotNull @Size(min = 1, max = 5) Set<String> interestedTopicsAndSkills, @NotBlank String objectiveStatement, @NotNull @Min(2) @Max(4) int size, boolean visibleInBrowser) {
        super(name, interestedTopicsAndSkills, objectiveStatement, size);
        this.visibleInBrowser = visibleInBrowser;
    }

    @NotNull
    private boolean visibleInBrowser;
}
