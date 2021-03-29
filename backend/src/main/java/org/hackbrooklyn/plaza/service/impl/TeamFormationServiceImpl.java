package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.dto.CreateTFParticipantProfileDTO;
import org.hackbrooklyn.plaza.exception.TeamFormationParticipantAlreadyExistsException;
import org.hackbrooklyn.plaza.model.TeamFormationParticipant;
import org.hackbrooklyn.plaza.model.TopicOrSkill;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.TeamFormationParticipantRepository;
import org.hackbrooklyn.plaza.repository.TopicOrSkillRepository;
import org.hackbrooklyn.plaza.service.TeamFormationService;
import org.hackbrooklyn.plaza.util.TeamFormationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class TeamFormationServiceImpl implements TeamFormationService {

    private final TeamFormationParticipantRepository teamFormationParticipantRepository;
    private final TopicOrSkillRepository topicOrSkillRepository;

    @Autowired
    public TeamFormationServiceImpl(TeamFormationParticipantRepository teamFormationParticipantRepository, TopicOrSkillRepository topicOrSkillRepository) {
        this.teamFormationParticipantRepository = teamFormationParticipantRepository;
        this.topicOrSkillRepository = topicOrSkillRepository;
    }

    @Override
    public void createParticipantProfile(User user, CreateTFParticipantProfileDTO participantProfileData) {
        if (teamFormationParticipantRepository.findFirstByUser(user).isPresent()) {
            throw new TeamFormationParticipantAlreadyExistsException();
        }

        TeamFormationParticipant createdProfile = new TeamFormationParticipant();
        createdProfile.setUser(user);
        createdProfile.setSpecialization(participantProfileData.getSpecialization());
        createdProfile.setObjectiveStatement(participantProfileData.getObjectiveStatement());
        createdProfile.setVisibleInBrowser(true);

        // Create a TopicOrSkill for each passed string
        Set<String> interestedTopicsAndSkills = participantProfileData.getInterestedTopicsAndSkills();

        Set<TopicOrSkill> topicsAndSkills = new HashSet<>(interestedTopicsAndSkills.size());
        for (String providedTopicOrSkillName : interestedTopicsAndSkills) {
            // Clean and try to find the topic or skill name in the database
            String cleanedTopicOrSkillName = TeamFormationUtils.cleanTopicOrSkillName(providedTopicOrSkillName);
            Optional<TopicOrSkill> existingTopicOrSkill = topicOrSkillRepository.findFirstByName(cleanedTopicOrSkillName);

            if (existingTopicOrSkill.isPresent()) {
                // Topic or skill was found, add it to the user's interested topics and skills
                topicsAndSkills.add(existingTopicOrSkill.get());
            } else {
                // Add the topic or skill if it doesn't exist
                TopicOrSkill newTopicOrSkill = new TopicOrSkill();
                newTopicOrSkill.setName(cleanedTopicOrSkillName);
                TopicOrSkill savedTopicOrSkill = topicOrSkillRepository.save(newTopicOrSkill);
                topicsAndSkills.add(savedTopicOrSkill);
            }
        }
        createdProfile.setInterestedTopicsAndSkills(topicsAndSkills);

        teamFormationParticipantRepository.save(createdProfile);
    }
}
