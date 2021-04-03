package org.hackbrooklyn.plaza.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hackbrooklyn.plaza.dto.CreateTFParticipantAndTeamDTO;
import org.hackbrooklyn.plaza.dto.CreateTFParticipantDTO;
import org.hackbrooklyn.plaza.dto.CreateTFTeamDTO;
import org.hackbrooklyn.plaza.dto.TeamFormationTeamSearchResponse;
import org.hackbrooklyn.plaza.exception.TeamFormationParticipantAlreadyExistsException;
import org.hackbrooklyn.plaza.exception.TeamFormationParticipantAlreadyInTeamException;
import org.hackbrooklyn.plaza.exception.TeamFormationParticipantNotFoundException;
import org.hackbrooklyn.plaza.exception.TeamFormationTeamNameConflictException;
import org.hackbrooklyn.plaza.model.*;
import org.hackbrooklyn.plaza.repository.TeamFormationParticipantRepository;
import org.hackbrooklyn.plaza.repository.TeamFormationTeamRepository;
import org.hackbrooklyn.plaza.repository.TopicOrSkillRepository;
import org.hackbrooklyn.plaza.service.TeamFormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.*;

import static org.hackbrooklyn.plaza.util.TeamFormationUtils.cleanTopicOrSkillName;

@Slf4j
@Service
public class TeamFormationServiceImpl implements TeamFormationService {

    private final TeamFormationParticipantRepository teamFormationParticipantRepository;
    private final TeamFormationTeamRepository teamFormationTeamRepository;
    private final TopicOrSkillRepository topicOrSkillRepository;
    private final EntityManager entityManager;

    @Autowired
    public TeamFormationServiceImpl(TeamFormationParticipantRepository teamFormationParticipantRepository, TeamFormationTeamRepository teamFormationTeamRepository, TopicOrSkillRepository topicOrSkillRepository, EntityManager entityManager) {
        this.teamFormationParticipantRepository = teamFormationParticipantRepository;
        this.teamFormationTeamRepository = teamFormationTeamRepository;
        this.topicOrSkillRepository = topicOrSkillRepository;
        this.entityManager = entityManager;
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
        newTeam.setSize(submittedData.getSize());
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

    @Override
    public TeamFormationParticipant getLoggedInParticipantData(User user) {
        return teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);
    }

    @Override
    public TeamFormationTeam getLoggedInParticipantTeamData(User user) {
        return getLoggedInParticipantData(user).getTeam();
    }

    @Override
    public TeamFormationTeamSearchResponse getTeams(int page, int limit, boolean personalized, String searchQuery, User user) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<TeamFormationTeam> query = cb.createQuery(TeamFormationTeam.class);

        // Query for teams and apply sorting and filters if provided
        Root<TeamFormationTeam> teams = query.from(TeamFormationTeam.class);
        query.select(teams);
        query.distinct(true);

        // Compute predicates depending on the user's options
        List<Predicate> predicates = new ArrayList<>();
        if (personalized) {
            // Return personalized teams based on the user's interested topics and skills
            TeamFormationParticipant participant = teamFormationParticipantRepository
                    .findFirstByUser(user)
                    .orElseThrow(TeamFormationParticipantNotFoundException::new);
            Set<TopicOrSkill> participantTopicsAndSkills = participant.getInterestedTopicsAndSkills();

            for (TopicOrSkill topicOrSkill : participantTopicsAndSkills) {
                predicates.add(
                        cb.equal(teams.join(TeamFormationTeam_.interestedTopicsAndSkills).get(TopicOrSkill_.name), topicOrSkill.getName())
                );
            }
        } else if (searchQuery != null) {
            if (StringUtils.substring(searchQuery, 0, 4).equals("tos:")) {
                // Do an exact search for the topic or skill when the tos: operator is used
                // Exact meaning case sensitive and with unprocessed input
                String searchedTopicOrSkill = StringUtils.substring(searchQuery, 4);

                predicates.add(
                        cb.equal(teams.join(TeamFormationTeam_.interestedTopicsAndSkills).get(TopicOrSkill_.name), searchedTopicOrSkill)
                );
            } else {
                // Search for an occurrence on the team name, interested topics and skills, and the objective statement
                String topicAndSkillPattern = "%" + cleanTopicOrSkillName(searchQuery) + "%";
                String searchQueryPattern = "%" + searchQuery.toLowerCase() + "%";

                predicates.add(cb.or(
                        cb.like(cb.lower(teams.get(TeamFormationTeam_.name)), searchQueryPattern),
                        cb.like(cb.lower(teams.get(TeamFormationTeam_.objectiveStatement)), searchQueryPattern),
                        cb.like(cb.lower(teams.join(TeamFormationTeam_.interestedTopicsAndSkills, JoinType.LEFT).get(TopicOrSkill_.name)), topicAndSkillPattern)
                ));
            }
        }

        // Finish query and get most recently created teams matching the results
        if (predicates.size() > 0) {
            query.where(cb.and(
                    cb.isTrue(teams.get(TeamFormationTeam_.visibleInBrowser))),
                    cb.or(predicates.toArray(new Predicate[0]))
            );
        } else {
            query.where(cb.isTrue(teams.get(TeamFormationTeam_.visibleInBrowser)));
        }
        query.orderBy(cb.desc(teams.get(TeamFormationTeam_.id)));
        TypedQuery<TeamFormationTeam> typedQuery = entityManager.createQuery(query);

        // Get total count and results from query
        long foundTeamsSize = typedQuery.getResultList().size();
        int totalPages = (int) Math.ceil((double) foundTeamsSize / limit);

        // Get paginated teams from query
        typedQuery.setFirstResult((page - 1) * limit);
        typedQuery.setMaxResults(limit);
        Collection<TeamFormationTeam> foundTeams = typedQuery.getResultList();

        return new TeamFormationTeamSearchResponse(
                foundTeams,
                totalPages,
                foundTeamsSize
        );
    }

    private Set<TopicOrSkill> getTopicsAndSkillsFromNames(Set<String> topicAndSkillNames) {
        Set<TopicOrSkill> topicsAndSkills = new HashSet<>(topicAndSkillNames.size());
        for (String providedTopicOrSkillName : topicAndSkillNames) {
            // Clean and try to find the topic or skill name in the database
            String cleanedTopicOrSkillName = cleanTopicOrSkillName(providedTopicOrSkillName);
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
