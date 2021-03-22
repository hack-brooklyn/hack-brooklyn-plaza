package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import static org.hackbrooklyn.plaza.model.SubmittedApplication.Decision;

@Data
@AllArgsConstructor
public class DecisionDTO {

    private Decision decision;
}
