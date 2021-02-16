package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.model.SubmittedApplication;
import org.springframework.web.multipart.MultipartFile;

public interface ApplyService {
    void processApplication(SubmittedApplication submittedApplication, MultipartFile resumeFile) throws Exception;

    boolean checkPriorityEligibility(String email);
}
