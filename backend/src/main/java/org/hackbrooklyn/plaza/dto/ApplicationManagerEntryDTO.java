package org.hackbrooklyn.plaza.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.hackbrooklyn.plaza.util.LocalDateTimeWithUTCSerializer;

import java.time.LocalDateTime;

/**
 * Represents a signle entry in the application manager.
 */
@Data
@AllArgsConstructor
public class ApplicationManagerEntryDTO {

    private int applicationNumber;

    @JsonSerialize(using = LocalDateTimeWithUTCSerializer.class)
    private LocalDateTime applicationTimestamp;

    private String firstName;
    private String lastName;
    private String email;
    private SubmittedApplication.Decision decision;
}
