package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Collection;

@Data
@AllArgsConstructor
public class MultipleApplicationsResponse {

    private Collection<ApplicationManagerDTO> applications;
    private int pages;
    private long totalFoundApplications;
    private long totalUndecidedApplications;
}
