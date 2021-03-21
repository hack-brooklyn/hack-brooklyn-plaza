package org.hackbrooklyn.plaza.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.hackbrooklyn.plaza.model.SubmittedApplication;

import static org.hackbrooklyn.plaza.model.SubmittedApplication.*;

@Data
@AllArgsConstructor
public class DecisionDTO {

    private Decision decision;
}
