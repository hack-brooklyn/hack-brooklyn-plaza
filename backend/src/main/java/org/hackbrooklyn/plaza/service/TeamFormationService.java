package org.hackbrooklyn.plaza.service;

import org.hackbrooklyn.plaza.dto.CreateTFParticipantProfileDTO;
import org.hackbrooklyn.plaza.model.User;

public interface TeamFormationService {

    void createParticipantProfile(User user, CreateTFParticipantProfileDTO participantProfileData);
}
