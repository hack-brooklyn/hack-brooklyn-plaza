package org.hackbrooklyn.plaza.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hackbrooklyn.plaza.dto.*;
import org.hackbrooklyn.plaza.exception.*;
import org.hackbrooklyn.plaza.model.*;
import org.hackbrooklyn.plaza.repository.*;
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
    private final TeamFormationTeamJoinRequestRepository teamFormationTeamJoinRequestRepository;
    private final TeamFormationParticipantInvitationRepository teamFormationParticipantInvitationRepository;
    private final TopicOrSkillRepository topicOrSkillRepository;
    private final EntityManager entityManager;

    @Autowired
    public TeamFormationServiceImpl(TeamFormationParticipantRepository teamFormationParticipantRepository, TeamFormationTeamRepository teamFormationTeamRepository, TeamFormationTeamJoinRequestRepository teamFormationTeamJoinRequestRepository, TeamFormationParticipantInvitationRepository teamFormationParticipantInvitationRepository, TopicOrSkillRepository topicOrSkillRepository, EntityManager entityManager) {
        this.teamFormationParticipantRepository = teamFormationParticipantRepository;
        this.teamFormationTeamRepository = teamFormationTeamRepository;
        this.teamFormationTeamJoinRequestRepository = teamFormationTeamJoinRequestRepository;
        this.teamFormationParticipantInvitationRepository = teamFormationParticipantInvitationRepository;
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

        // Set the creating user's team to the new one and gide the user from the participant browser since they're now in a team
        userParticipant.setTeam(savedNewTeam);
        userParticipant.setVisibleInBrowser(false);

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
    public TeamFormationTeamSearchResponse getTeams(int page, int limit, boolean personalized, boolean hideSentJoinRequests, String searchQuery, User user) {
        TeamFormationParticipant participant = null;

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<TeamFormationTeam> query = cb.createQuery(TeamFormationTeam.class);

        // Query for teams and apply sorting and filters if provided
        Root<TeamFormationTeam> teams = query.from(TeamFormationTeam.class);
        query.select(teams);
        query.distinct(true);

        // Compute predicates depending on the user's options
        List<Predicate> orPredicates = new ArrayList<>();
        if (personalized) {
            // Return personalized teams based on the user's interested topics and skills
            participant = teamFormationParticipantRepository
                    .findFirstByUser(user)
                    .orElseThrow(TeamFormationParticipantNotFoundException::new);
            Set<TopicOrSkill> participantTopicsAndSkills = participant.getInterestedTopicsAndSkills();

            for (TopicOrSkill topicOrSkill : participantTopicsAndSkills) {
                orPredicates.add(
                        cb.equal(teams.join(TeamFormationTeam_.interestedTopicsAndSkills).get(TopicOrSkill_.name), topicOrSkill.getName())
                );
            }
        } else if (searchQuery != null) {
            if (StringUtils.substring(searchQuery, 0, 4).equals("tos:")) {
                // Do an exact search for the topic or skill when the tos: operator is used
                // Exact meaning case sensitive and with unprocessed input
                String searchedTopicOrSkill = StringUtils.substring(searchQuery, 4);

                orPredicates.add(
                        cb.equal(teams.join(TeamFormationTeam_.interestedTopicsAndSkills).get(TopicOrSkill_.name), searchedTopicOrSkill)
                );
            } else {
                // Search for an occurrence on the team name, interested topics and skills, and the objective statement
                String topicAndSkillPattern = "%" + cleanTopicOrSkillName(searchQuery) + "%";
                String searchQueryPattern = "%" + searchQuery.toLowerCase() + "%";

                orPredicates.add(cb.or(
                        cb.like(cb.lower(teams.get(TeamFormationTeam_.name)), searchQueryPattern),
                        cb.like(cb.lower(teams.get(TeamFormationTeam_.objectiveStatement)), searchQueryPattern),
                        cb.like(cb.lower(teams.join(TeamFormationTeam_.interestedTopicsAndSkills, JoinType.LEFT).get(TopicOrSkill_.name)), topicAndSkillPattern)
                ));
            }
        }

        // Add necessary requirements during search
        List<Predicate> andPredicates = new ArrayList<>();
        andPredicates.add(cb.isTrue(teams.get(TeamFormationTeam_.visibleInBrowser)));

        if (hideSentJoinRequests) {
            if (participant == null) {
                participant = teamFormationParticipantRepository
                        .findFirstByUser(user)
                        .orElseThrow(TeamFormationParticipantNotFoundException::new);
            }

            // Hide found teams that have a join request from the user
            Expression<TeamFormationParticipant> requestingParticipant = teams.join(TeamFormationTeam_.receivedTeamJoinRequests, JoinType.LEFT).get(TeamFormationTeamJoinRequest_.requestingParticipant);
            andPredicates.add(cb.or(
                    cb.notEqual(requestingParticipant, participant),
                    cb.isNull(requestingParticipant)
            ));
        }

        if (orPredicates.size() > 0) {
            andPredicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
        }

        // Finish query and get most recently created teams matching the results
        query.where(cb.and(andPredicates.toArray(new Predicate[0])));
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

    /**
     * The `personalized` feature will only work if the user is in a team since the feature relies on the user's team's
     * interested topics and skills to determine personalized results
     */
    @Override
    public TeamFormationParticipantSearchResponse getParticipants(int page, int limit, boolean personalized, boolean hideSentInvitations, String searchQuery, User user) {
        TeamFormationParticipant userParticipant = null;

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<TeamFormationParticipant> query = cb.createQuery(TeamFormationParticipant.class);

        // Query for participants and apply sorting and filters if provided
        Root<TeamFormationParticipant> participants = query.from(TeamFormationParticipant.class);
        query.select(participants);
        query.distinct(true);

        // Compute predicates depending on the user's options
        List<Predicate> orPredicates = new ArrayList<>();
        if (personalized) {
            // Return personalized participants based on the team's interested topics and skills
            userParticipant = teamFormationParticipantRepository
                    .findFirstByUser(user)
                    .orElseThrow(TeamFormationParticipantNotFoundException::new);
            if (userParticipant.getTeam() == null) {
                throw new TeamFormationParticipantNotInTeamException();
            }

            Set<TopicOrSkill> teamTopicsAndSkills = userParticipant.getTeam().getInterestedTopicsAndSkills();

            for (TopicOrSkill topicOrSkill : teamTopicsAndSkills) {
                orPredicates.add(
                        cb.equal(participants.join(TeamFormationParticipant_.interestedTopicsAndSkills).get(TopicOrSkill_.name), topicOrSkill.getName())
                );
            }
        } else if (searchQuery != null) {
            if (StringUtils.substring(searchQuery, 0, 4).equals("tos:")) {
                // Do an exact search for the topic or skill when the tos: operator is used
                // Exact meaning case sensitive and with unprocessed input
                String searchedTopicOrSkill = StringUtils.substring(searchQuery, 4);

                orPredicates.add(
                        cb.equal(participants.join(TeamFormationParticipant_.interestedTopicsAndSkills).get(TopicOrSkill_.name), searchedTopicOrSkill)
                );
            } else {
                // Search for an occurrence on the participant's name, interested topics and skills, and the objective statement
                String searchQueryPattern = "%" + searchQuery.toLowerCase() + "%";
                String topicAndSkillPattern = "%" + cleanTopicOrSkillName(searchQuery) + "%";

                // Concatenate the participant's first and last name separated by a space in the middle
                Expression<String> firstNameWithSpace = cb.concat(participants.join(TeamFormationParticipant_.user).get(User_.firstName), " ");
                Expression<String> firstAndLastNameWithSpace = cb.concat(firstNameWithSpace, participants.join(TeamFormationParticipant_.user).get(User_.lastName));

                orPredicates.add(cb.or(
                        cb.like(cb.lower(firstAndLastNameWithSpace), searchQueryPattern),
                        cb.like(cb.lower(participants.get(TeamFormationParticipant_.objectiveStatement)), searchQueryPattern),
                        cb.like(cb.lower(participants.join(TeamFormationParticipant_.interestedTopicsAndSkills, JoinType.LEFT).get(TopicOrSkill_.name)), topicAndSkillPattern)
                ));
            }
        }

        // Add necessary requirements during search
        List<Predicate> andPredicates = new ArrayList<>();
        andPredicates.add(cb.isTrue(participants.get(TeamFormationParticipant_.visibleInBrowser)));

        if (hideSentInvitations) {
            if (userParticipant == null) {
                userParticipant = teamFormationParticipantRepository
                        .findFirstByUser(user)
                        .orElseThrow(TeamFormationParticipantNotFoundException::new);
            }

            if (userParticipant.getTeam() == null) {
                throw new TeamFormationParticipantNotInTeamException();
            }

            // Hide found participants that have an invitation from the user's team
            Expression<TeamFormationTeam> invitingTeam = participants.join(TeamFormationParticipant_.receivedParticipantInvitations, JoinType.LEFT).get(TeamFormationParticipantInvitation_.invitingTeam);
            andPredicates.add(cb.or(
                    cb.notEqual(invitingTeam, userParticipant.getTeam()),
                    cb.isNull(invitingTeam)
            ));
        }

        if (orPredicates.size() > 0) {
            andPredicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
        }

        // Finish query and get most recently created participants matching the results
        query.where(cb.and(andPredicates.toArray(new Predicate[0])));
        query.orderBy(cb.desc(participants.get(TeamFormationParticipant_.id)));
        TypedQuery<TeamFormationParticipant> typedQuery = entityManager.createQuery(query);

        // Get total count and results from query
        long foundParticipantsSize = typedQuery.getResultList().size();
        int totalPages = (int) Math.ceil((double) foundParticipantsSize / limit);

        // Get paginated participants from query
        typedQuery.setFirstResult((page - 1) * limit);
        typedQuery.setMaxResults(limit);
        Collection<TeamFormationParticipant> foundParticipants = typedQuery.getResultList();

        return new TeamFormationParticipantSearchResponse(
                foundParticipants,
                totalPages,
                foundParticipantsSize
        );
    }

    @Override
    public void requestToJoinTeam(int teamId, MessageDTO requestData, User user) {
        TeamFormationParticipant requestingParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationTeam requestedTeam = teamFormationTeamRepository
                .findById(teamId)
                .orElseThrow(TeamFormationTeamNotFoundException::new);

        // Check if the participant already sent the team a request
        if (requestedTeam.getReceivedTeamJoinRequests().stream()
                .anyMatch(joinRequest -> joinRequest
                        .getRequestingParticipant()
                        .equals(requestingParticipant))) {
            throw new TeamFormationTeamJoinRequestAlreadySentException();
        }

        TeamFormationTeamJoinRequest joinRequest = new TeamFormationTeamJoinRequest();

        joinRequest.setRequestedTeam(requestedTeam);
        joinRequest.setRequestingParticipant(requestingParticipant);
        joinRequest.setMessage(requestData.getMessage());

        teamFormationTeamJoinRequestRepository.save(joinRequest);
    }

    @Override
    public void inviteParticipantToTeam(int participantId, MessageDTO invitationData, User user) {
        TeamFormationParticipant invitingTeamMember = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);
        TeamFormationTeam invitingTeam = invitingTeamMember.getTeam();

        TeamFormationParticipant invitedParticipant = teamFormationParticipantRepository
                .findById(participantId)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        // Check if the team already sent the participant an invitation
        if (invitedParticipant.getReceivedParticipantInvitations().stream()
                .anyMatch(participantInvitation -> participantInvitation
                        .getInvitingTeam()
                        .equals(invitingTeam))) {
            throw new TeamFormationParticipantInvitationAlreadySentException();
        }

        TeamFormationParticipantInvitation participantInvitation = new TeamFormationParticipantInvitation();

        participantInvitation.setInvitingTeam(invitingTeam);
        participantInvitation.setInvitedParticipant(invitedParticipant);
        participantInvitation.setMessage(invitationData.getMessage());

        teamFormationParticipantInvitationRepository.save(participantInvitation);
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
