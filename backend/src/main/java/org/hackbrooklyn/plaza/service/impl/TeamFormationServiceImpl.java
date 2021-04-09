package org.hackbrooklyn.plaza.service.impl;

import com.google.common.primitives.Ints;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hackbrooklyn.plaza.dto.*;
import org.hackbrooklyn.plaza.exception.*;
import org.hackbrooklyn.plaza.model.*;
import org.hackbrooklyn.plaza.repository.*;
import org.hackbrooklyn.plaza.repository.TeamFormationTeamJoinRequestRepository.RequestIdsOnly;
import org.hackbrooklyn.plaza.service.TeamFormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.*;
import java.util.*;
import java.util.stream.Collectors;

import static org.hackbrooklyn.plaza.repository.TeamFormationParticipantInvitationRepository.*;
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
    public void createParticipant(User user, TeamFormationParticipantFormDataDTO submittedData) {
        if (teamFormationParticipantRepository.findFirstByUser(user).isPresent()) {
            throw new TeamFormationParticipantAlreadyExistsException();
        }

        TeamFormationParticipant newParticipant = new TeamFormationParticipant();
        newParticipant.setUser(user);
        newParticipant.setVisibleInBrowser(true);
        setCommonParticipantDataAndSave(submittedData, newParticipant);
    }

    @Override
    @Transactional
    public void createTeam(User user, TeamFormationTeamFormDataDTO submittedData) {
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
        newTeam.setLeader(userParticipant);
        newTeam.setName(submittedData.getName());
        newTeam.setObjectiveStatement(submittedData.getObjectiveStatement());
        newTeam.setSize(submittedData.getSize());
        newTeam.setVisibleInBrowser(true);

        Set<String> topicAndSkillNames = submittedData.getInterestedTopicsAndSkills();
        Set<TopicOrSkill> topicsAndSkills = getTopicsAndSkillsFromNames(topicAndSkillNames);
        newTeam.setInterestedTopicsAndSkills(topicsAndSkills);

        Set<TeamFormationParticipant> newTeamMembers = new HashSet<>(1);
        newTeamMembers.add(userParticipant);
        newTeam.setMembers(newTeamMembers);

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
    public void createParticipantAndTeam(CreateTeamFormationParticipantAndTeamDTO submittedData, User user) {
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
    public void updateLoggedInParticipantData(TeamFormationParticipantFormDataWithBrowserVisibilityDTO submittedData, User user) {
        TeamFormationParticipant updatingParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        if (submittedData.isVisibleInBrowser() && updatingParticipant.getTeam() != null) {
            throw new TeamFormationParticipantAlreadyInTeamException();
        }

        updatingParticipant.setVisibleInBrowser(submittedData.isVisibleInBrowser());
        setCommonParticipantDataAndSave(submittedData, updatingParticipant);
    }

    @Override
    public TeamFormationTeam getLoggedInParticipantTeamData(User user) {
        return getLoggedInParticipantData(user).getTeam();
    }

    @Override
    public void updateLoggedInParticipantTeamData(TeamFormationTeamFormDataWithBrowserVisibilityDTO submittedData, User user) {
        TeamFormationParticipant updatingTeamMember = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationTeam updatingTeam = updatingTeamMember.getTeam();

        if (updatingTeam == null) {
            throw new TeamFormationParticipantNotInTeamException();
        }

        // Check if the new team size would exceed the current team size
        int currentTeamSize = updatingTeam.getMembers().size();
        if (currentTeamSize > submittedData.getSize()) {
            throw new TeamFormationTeamFullException();
        }

        // Check if a team already exists with the provided team name
        if (!submittedData.getName().equals(updatingTeam.getName()) && teamFormationTeamRepository.findFirstByName(submittedData.getName()).isPresent()) {
            throw new TeamFormationTeamNameConflictException();
        }

        updatingTeam.setName(submittedData.getName());
        updatingTeam.setObjectiveStatement(submittedData.getObjectiveStatement());
        updatingTeam.setSize(submittedData.getSize());

        updatingTeam.setVisibleInBrowser(submittedData.isVisibleInBrowser());
        if (currentTeamSize >= submittedData.getSize()) {
            updatingTeam.setVisibleInBrowser(false);
        }

        Set<String> topicAndSkillNames = submittedData.getInterestedTopicsAndSkills();
        Set<TopicOrSkill> topicsAndSkills = getTopicsAndSkillsFromNames(topicAndSkillNames);
        updatingTeam.setInterestedTopicsAndSkills(topicsAndSkills);

        teamFormationTeamRepository.save(updatingTeam);
    }

    @Override
    @Transactional
    public void removeMemberFromLoggedInParticipantTeam(int participantId, User user) {
        TeamFormationParticipant memberPerformingRemoval = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationTeam teamToModify = memberPerformingRemoval.getTeam();

        if (teamToModify == null) {
            throw new TeamFormationParticipantNotInTeamException();
        }

        if (teamToModify.getLeader() != memberPerformingRemoval) {
            throw new TeamFormationNoPermissionException();
        }

        TeamFormationParticipant memberToRemove = teamToModify.getMembers().stream()
                .filter(member -> member.getId() == participantId)
                .findFirst()
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        // Remove the team from the participant's side
        memberToRemove.setTeam(null);
        teamFormationParticipantRepository.save(memberToRemove);

        // Remove the member from the team on the team's side
        teamToModify.getMembers().remove(memberToRemove);
        teamFormationTeamRepository.save(teamToModify);
    }

    @Override
    @Transactional
    public void deleteLoggedInParticipantTeam(User user) {
        TeamFormationParticipant memberPerformingDeletion = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationTeam teamToDelete = memberPerformingDeletion.getTeam();
        if (teamToDelete == null) throw new TeamFormationParticipantNotInTeamException();
        if (teamToDelete.getLeader() != memberPerformingDeletion) throw new TeamFormationNoPermissionException();

        // Remove each team member from the team
        for (TeamFormationParticipant teamMember : teamToDelete.getMembers()) {
            teamMember.setTeam(null);
            teamFormationParticipantRepository.save(teamMember);
        }

        // Manually delete many-to-many relation for interested topics and skills
        teamToDelete.getInterestedTopicsAndSkills().clear();
        teamFormationTeamRepository.save(teamToDelete);

        // The cascade will remove the one-to-many relations for the team's join requests and invitations
        teamFormationTeamRepository.delete(teamToDelete);
    }

    @Override
    @Transactional
    public void leaveTeam(User user) {
        TeamFormationParticipant leavingMember = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationTeam leftTeam = leavingMember.getTeam();

        if (leftTeam == null) {
            throw new TeamFormationParticipantNotInTeamException();
        }

        leavingMember.setTeam(null);
        teamFormationParticipantRepository.save(leavingMember);

        leftTeam.getMembers().remove(leavingMember);
        teamFormationTeamRepository.save(leftTeam);
    }

    @Override
    public TeamFormationTeamSearchDTO getTeams(int page, int limit, boolean personalized, boolean hideSentJoinRequests, String searchQuery, User user) {
        TeamFormationParticipant participant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

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

        // Don't return the user's current team if they're in one already
        if (participant.getTeam() != null) {
            andPredicates.add(cb.notEqual(teams.get(TeamFormationTeam_.id), participant.getTeam().getId()));
        }

        // Hide found teams that have a join request from the user
        if (hideSentJoinRequests) {
            Expression<TeamFormationParticipant> requestingParticipant = teams.join(TeamFormationTeam_.receivedTeamJoinRequests, JoinType.LEFT).get(TeamFormationTeamJoinRequest_.requestingParticipant);
            andPredicates.add(cb.or(
                    cb.notEqual(requestingParticipant, participant),
                    cb.isNull(requestingParticipant)
            ));
        }

        // Add constraints specified by query parameters if any were specified
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

        return new TeamFormationTeamSearchDTO(
                totalPages,
                foundTeams,
                foundTeamsSize
        );
    }

    /**
     * The `personalized` feature will only work if the user is in a team since the feature relies on the user's team's
     * interested topics and skills to determine personalized results
     */
    @Override
    public TeamFormationParticipantSearchDTO getParticipants(int page, int limit, boolean personalized, boolean hideSentInvitations, String searchQuery, User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

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

        // Don't return the participant that is currently getting the list of participants
        andPredicates.add(cb.notEqual(participants.get(TeamFormationParticipant_.id), userParticipant.getId()));

        // Hide found participants that have an invitation from the user's team
        if (userParticipant.getTeam() != null && hideSentInvitations) {
            Expression<TeamFormationTeam> invitingTeam = participants.join(TeamFormationParticipant_.receivedParticipantInvitations, JoinType.LEFT).get(TeamFormationParticipantInvitation_.invitingTeam);
            andPredicates.add(cb.or(
                    cb.notEqual(invitingTeam, userParticipant.getTeam()),
                    cb.isNull(invitingTeam)
            ));
        }

        // Add constraints specified by query parameters if any were specified
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

        return new TeamFormationParticipantSearchDTO(
                totalPages,
                foundParticipants,
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

        if (requestingParticipant.getTeam() != null) {
            throw new TeamFormationParticipantAlreadyInTeamException();
        }

        if (requestedTeam.getMembers().size() >= requestedTeam.getSize()) {
            throw new TeamFormationTeamFullException();
        }

        // Try to find an invitation already sent by the participant and throw an exception if there is
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

        if (invitingTeam == null) {
            throw new TeamFormationParticipantNotInTeamException();
        }

        if (invitingTeam.getMembers().size() >= invitingTeam.getSize()) {
            throw new TeamFormationTeamFullException();
        }

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

    @Override
    public TeamFormationTeamInboxDTO getTeamInbox(int page, int limit, User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        if (userParticipant.getTeam() == null) {
            throw new TeamFormationParticipantNotInTeamException();
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<TeamFormationTeamJoinRequest> query = cb.createQuery(TeamFormationTeamJoinRequest.class);

        // Query for all messages that are in the team's inbox
        Root<TeamFormationTeamJoinRequest> joinRequests = query.from(TeamFormationTeamJoinRequest.class);
        query.select(joinRequests);
        query.distinct(true);

        // Load the lazy-loaded requestingParticipant field
        joinRequests.fetch(TeamFormationTeamJoinRequest_.requestingParticipant);

        query.where(cb.and(
                cb.isNull(joinRequests.get(TeamFormationTeamJoinRequest_.requestAccepted)),
                cb.equal(joinRequests.get(TeamFormationTeamJoinRequest_.requestedTeam), userParticipant.getTeam())
        ));
        query.orderBy(cb.desc(joinRequests.get(TeamFormationTeamJoinRequest_.requestTimestamp)));
        TypedQuery<TeamFormationTeamJoinRequest> typedQuery = entityManager.createQuery(query);

        // Get total count and results from query
        long foundJoinRequestsSize = typedQuery.getResultList().size();
        int totalPages = (int) Math.ceil((double) foundJoinRequestsSize / limit);

        // Get paginated join requests from query
        typedQuery.setFirstResult((page - 1) * limit);
        typedQuery.setMaxResults(limit);
        Collection<TeamFormationTeamJoinRequest> foundJoinRequests = typedQuery.getResultList();

        return new TeamFormationTeamInboxDTO(totalPages, foundJoinRequests, foundJoinRequestsSize);
    }

    @Override
    public TeamFormationMessageIdsDTO getTeamInboxMessageIds(User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        if (userParticipant.getTeam() == null) {
            throw new TeamFormationParticipantNotInTeamException();
        }

        List<RequestIdsOnly> messageIdsProjection = teamFormationTeamJoinRequestRepository.
                findAllByRequestedTeamAndRequestAcceptedNullOrderByRequestTimestamp(userParticipant.getTeam());

        // Convert RequestIdsOnly projection to list of Integers
        List<Integer> messageIds = messageIdsProjection.stream()
                .map(RequestIdsOnly::getRequestId)
                .collect(Collectors.toList());

        return new TeamFormationMessageIdsDTO(Ints.toArray(messageIds));
    }

    @Override
    public TeamFormationTeamJoinRequest getTeamJoinRequestDetails(int joinRequestId, User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationTeamJoinRequest foundJoinRequest = teamFormationTeamJoinRequestRepository
                .findByIdLoadParticipant(joinRequestId)
                .orElseThrow(TeamFormationTeamJoinRequestNotFoundException::new);

        // Only allow team members in the team receiving the join request to view the join request
        if (foundJoinRequest.getRequestedTeam() != userParticipant.getTeam() || userParticipant.getTeam() == null) {
            throw new TeamFormationNoPermissionException();
        }

        return foundJoinRequest;
    }

    @Override
    @Transactional
    public void setTeamJoinRequestAccepted(int joinRequestId, Boolean requestAccepted, User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationTeamJoinRequest foundJoinRequest = teamFormationTeamJoinRequestRepository
                .findByIdLoadParticipant(joinRequestId)
                .orElseThrow(TeamFormationTeamJoinRequestNotFoundException::new);

        // Only allow team members in the team receiving the join request to set the accepted status of a join request
        if (foundJoinRequest.getRequestedTeam() != userParticipant.getTeam() || userParticipant.getTeam() == null) {
            throw new TeamFormationNoPermissionException();
        }

        if (requestAccepted) {
            // Send an invitation to the invited participant
            MessageDTO invitationMessage = new MessageDTO(
                    String.format(
                            "The team you requested to join, %s, has sent you an invitation!",
                            foundJoinRequest.getRequestedTeam().getName()
                    )
            );

            inviteParticipantToTeam(foundJoinRequest.getRequestingParticipant().getId(), invitationMessage, user);
        }

        foundJoinRequest.setRequestAccepted(requestAccepted);
        teamFormationTeamJoinRequestRepository.save(foundJoinRequest);
    }

    @Override
    public TeamFormationParticipantInboxDTO getParticipantInbox(int page, int limit, User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<TeamFormationParticipantInvitation> query = cb.createQuery(TeamFormationParticipantInvitation.class);

        // Query for all messages that are in the participant's inbox
        Root<TeamFormationParticipantInvitation> invitations = query.from(TeamFormationParticipantInvitation.class);
        query.select(invitations);
        query.distinct(true);

        // Load the lazy-loaded invitingTeam field
        invitations.fetch(TeamFormationParticipantInvitation_.invitingTeam);

        query.where(cb.and(
                cb.isNull(invitations.get(TeamFormationParticipantInvitation_.invitationAccepted)),
                cb.equal(invitations.get(TeamFormationParticipantInvitation_.invitedParticipant), userParticipant)
        ));
        query.orderBy(cb.desc(invitations.get(TeamFormationParticipantInvitation_.invitationTimestamp)));
        TypedQuery<TeamFormationParticipantInvitation> typedQuery = entityManager.createQuery(query);

        // Get total count and results from query
        long foundInvitationsSize = typedQuery.getResultList().size();
        int totalPages = (int) Math.ceil((double) foundInvitationsSize / limit);

        // Get paginated join requests from query
        typedQuery.setFirstResult((page - 1) * limit);
        typedQuery.setMaxResults(limit);
        Collection<TeamFormationParticipantInvitation> foundInvitations = typedQuery.getResultList();

        return new TeamFormationParticipantInboxDTO(totalPages, foundInvitations, foundInvitationsSize);
    }

    @Override
    public TeamFormationMessageIdsDTO getParticipantInboxMessageIds(User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        List<InvitationIdsOnly> messageIdsProjection = teamFormationParticipantInvitationRepository
                .findAllByInvitedParticipantAndInvitationAcceptedNullOrderByInvitationTimestamp(userParticipant);

        // Convert InvitationIdsOnly projection to list of Integers
        List<Integer> messageIds = messageIdsProjection.stream()
                .map(InvitationIdsOnly::getInvitationId)
                .collect(Collectors.toList());

        return new TeamFormationMessageIdsDTO(Ints.toArray(messageIds));
    }

    @Override
    public TeamFormationParticipantInvitation getParticipantInvitationDetails(int invitationId, User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationParticipantInvitation foundInvitation = teamFormationParticipantInvitationRepository
                .findByIdLoadTeam(invitationId)
                .orElseThrow(TeamFormationParticipantInvitationNotFoundException::new);

        // Only allow the recipient of the invitation to view the invitation
        if (foundInvitation.getInvitedParticipant() != userParticipant) {
            throw new TeamFormationParticipantInvitationInaccessibleException();
        }

        return foundInvitation;
    }

    @Override
    @Transactional
    public void setParticipantInvitationAccepted(int invitationId, Boolean invitationAccepted, User user) {
        TeamFormationParticipant userParticipant = teamFormationParticipantRepository
                .findFirstByUser(user)
                .orElseThrow(TeamFormationParticipantNotFoundException::new);

        TeamFormationParticipantInvitation foundInvitation = teamFormationParticipantInvitationRepository
                .findByIdLoadTeam(invitationId)
                .orElseThrow(TeamFormationParticipantInvitationNotFoundException::new);

        TeamFormationParticipant invitedParticipant = foundInvitation.getInvitedParticipant();

        // Only allow the recipient of the invitation to set the accepted status of an invitation
        if (invitedParticipant != userParticipant) {
            throw new TeamFormationParticipantInvitationInaccessibleException();
        }

        // Add the participant to the team if the user accepted the invitation
        if (invitationAccepted) {
            TeamFormationTeam invitingTeam = foundInvitation.getInvitingTeam();

            if (invitedParticipant.getTeam() != null) {
                throw new TeamFormationParticipantAlreadyInTeamException();
            }

            int teamCurrentSize = invitingTeam.getMembers().size();
            int teamMaxSize = invitingTeam.getSize();
            if (teamCurrentSize >= teamMaxSize) {
                throw new TeamFormationTeamFullException();
            }

            // The team has room left, add them to the team
            invitingTeam.getMembers().add(invitedParticipant);

            // Hide the team from the team browser if they will be full after the member joins
            if (teamCurrentSize + 1 >= teamMaxSize) {
                invitingTeam.setVisibleInBrowser(false);
            }

            TeamFormationTeam savedInvitingTeam = teamFormationTeamRepository.save(invitingTeam);

            invitedParticipant.setTeam(savedInvitingTeam);
            invitedParticipant.setVisibleInBrowser(false);
            teamFormationParticipantRepository.save(invitedParticipant);
        }

        foundInvitation.setInvitationAccepted(invitationAccepted);
        teamFormationParticipantInvitationRepository.save(foundInvitation);
    }

    private void setCommonParticipantDataAndSave(TeamFormationParticipantFormDataDTO submittedData, TeamFormationParticipant participant) {
        participant.setSpecialization(submittedData.getSpecialization());
        participant.setObjectiveStatement(submittedData.getObjectiveStatement());
        participant.setContactInfo(submittedData.getContactInfo());

        Set<String> topicAndSkillNames = submittedData.getInterestedTopicsAndSkills();
        Set<TopicOrSkill> topicsAndSkills = getTopicsAndSkillsFromNames(topicAndSkillNames);
        participant.setInterestedTopicsAndSkills(topicsAndSkills);

        teamFormationParticipantRepository.save(participant);
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
