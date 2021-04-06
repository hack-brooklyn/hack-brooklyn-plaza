package org.hackbrooklyn.plaza.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;

import java.util.Collection;

@Data
@RequiredArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class MultipleApplicationsDTO extends PaginatedResponse {

    public MultipleApplicationsDTO(int pages, Collection<ApplicationManagerEntryDTO> applications, long totalFoundApplications, long totalUndecidedApplications) {
        super(pages);
        this.applications = applications;
        this.totalFoundApplications = totalFoundApplications;
        this.totalUndecidedApplications = totalUndecidedApplications;
    }

    private Collection<ApplicationManagerEntryDTO> applications;
    private long totalFoundApplications;
    private long totalUndecidedApplications;
}
