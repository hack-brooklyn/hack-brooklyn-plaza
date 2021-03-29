package org.hackbrooklyn.plaza.service.impl;

import org.hackbrooklyn.plaza.dto.CreateTFParticipantAndTeamDTO;
import org.hackbrooklyn.plaza.dto.CreateTFParticipantDTO;
import org.hackbrooklyn.plaza.dto.CreateTFTeamDTO;
import org.hackbrooklyn.plaza.exception.TeamFormationParticipantAlreadyExistsException;
import org.hackbrooklyn.plaza.exception.TeamFormationParticipantAlreadyInTeamException;
import org.hackbrooklyn.plaza.exception.TeamFormationParticipantNotFoundException;
import org.hackbrooklyn.plaza.exception.TeamFormationTeamNameConflictException;
import org.hackbrooklyn.plaza.model.TeamFormationParticipant;
import org.hackbrooklyn.plaza.model.TeamFormationTeam;
import org.hackbrooklyn.plaza.model.TopicOrSkill;
import org.hackbrooklyn.plaza.model.User;
import org.hackbrooklyn.plaza.repository.TeamFormationParticipantRepository;
import org.hackbrooklyn.plaza.repository.TeamFormationTeamRepository;
import org.hackbrooklyn.plaza.repository.TopicOrSkillRepository;
import org.hackbrooklyn.plaza.service.TeamFormationService;
import org.hackbrooklyn.plaza.util.TeamFormationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class TeamFormationServiceImpl implements TeamFormationService {

    private final TeamFormationParticipantRepository teamFormationParticipantRepository;
    private final TeamFormationTeamRepository teamFormationTeamRepository;
    private final TopicOrSkillRepository topicOrSkillRepository;

    @Autowired
    public TeamFormationServiceImpl(TeamFormationParticipantRepository teamFormationParticipantRepository, TeamFormationTeamRepository teamFormationTeamRepository, TopicOrSkillRepository topicOrSkillRepository) {
        this.teamFormationParticipantRepository = teamFormationParticipantRepository;
        this.teamFormationTeamRepository = teamFormationTeamRepository;
        this.topicOrSkillRepository = topicOrSkillRepository;
    }

    @Override
    @Transactional
    public void createParticipant(User user, CreateTFParticipantDTO submittedData) {
        if (teamFormationParticipantRepository.findFirstByUser(user).isPresent()) {
            throw new TeamFormationParticipantAlreadyExistsException();
        }

        TeamFormationParticipant newParticipant = new TeamFormationParticipant();
        newParticipant.setUser(user);
        newParticipant.setSpecialization(submittedData.getSpecialization());
        newParticipant.setObjectiveStatement(submittedData.getObjectiveStatement());
        newParticipant.setVisibleInBrowser(true);

        Set<String> topicAndSkillNames = submittedData.getInterestedTopicsAndSkills();
        Set<TopicOrSkill> topicsAndSkills = getTopicsAndSkillsFromNames(topicAndSkillNames);
        newParticipant.setInterestedTopicsAndSkills(topicsAndSkills);

        teamFormationParticipantRepository.save(newParticipant);
    }

    @Override
    @Transactional
    public void createTeam(User user, CreateTFTeamDTO submittedData) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        // Check if the user is already part of another team
        if (userParticipant.getTeam() != null) {
            throw new TeamFormationParticipantAlreadyInTeamException();
        }

        // Check if a team already exists with the provided team name
        if (teamFormationTeamRepository.findFirstByName(submittedData.getName()).isPresent()) {
            throw new TeamFormationTeamNameConflictException();
        }

        // Create and save the team
        TeamFormationTeam newTeam = new TeamFormationTeam();
        newTeam.setName(submittedData.getName());
        newTeam.setObjectiveStatement(submittedData.getObjectiveStatement());
        newTeam.setVisibleInBrowser(true);

        Set<TeamFormationParticipant> newTeamMembers = new HashSet<>(1);
        newTeamMembers.add(userParticipant);
        newTeam.setMembers(newTeamMembers);

        Set<String> topicAndSkillNames = submittedData.getInterestedTopicsAndSkills();
        Set<TopicOrSkill> topicsAndSkills = getTopicsAndSkillsFromNames(topicAndSkillNames);
        newTeam.setInterestedTopicsAndSkills(topicsAndSkills);

        TeamFormationTeam savedNewTeam = teamFormationTeamRepository.save(newTeam);

        // Set the user's team to the new one and save it
        userParticipant.setTeam(savedNewTeam);
        teamFormationParticipantRepository.save(userParticipant);
    }

    /**
     * Perform both createParticipant() and createTeam() and roll back both if any one of them fail
     */
    @Override
    @Transactional
    public void createParticipantAndTeam(User user, CreateTFParticipantAndTeamDTO submittedData) {
        createParticipant(user, submittedData.getParticipant());
        createTeam(user, submittedData.getTeam());
    }

    private Set<TopicOrSkill> getTopicsAndSkillsFromNames(Set<String> topicAndSkillNames) {
        Set<TopicOrSkill> topicsAndSkills = new HashSet<>(topicAndSkillNames.size());
        for (String providedTopicOrSkillName : topicAndSkillNames) {
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

        return topicsAndSkills;
    }
}
