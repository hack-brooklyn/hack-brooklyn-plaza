package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators.PropertyGenerator;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hackbrooklyn.plaza.serializer.ParticipantUserSerializer;
import org.hackbrooklyn.plaza.serializer.TopicOrSkillSetSerializer;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Set;

@Entity
@Table(name = "team_formation_participants")
@JsonIdentityInfo(generator = PropertyGenerator.class, property = "id")
@Getter
@Setter
@RequiredArgsConstructor
public class TeamFormationParticipant {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @NotNull
    @JsonSerialize(using = ParticipantUserSerializer.class)
    private User user;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private TeamFormationTeam team;

    @Column(name = "specialization")
    @NotBlank
    @NotNull
    private String specialization;

    @Column(name = "objective_statement")
    @Size(min = 1, max = 200)
    @NotBlank
    @NotNull
    private String objectiveStatement;

    @Column(name = "visible_in_browser")
    @NotNull
    private boolean visibleInBrowser;

    @ManyToMany
    @JoinTable(
            name = "team_formation_participant_topics_and_skills",
            joinColumns = {@JoinColumn(name = "user_id")},
            inverseJoinColumns = {@JoinColumn(name = "topic_or_skill_id")}
    )
    @NotNull
    @JsonSerialize(using = TopicOrSkillSetSerializer.class)
    private Set<TopicOrSkill> interestedTopicsAndSkills;

    @OneToMany(mappedBy = "requestingParticipant")
    @JsonIgnore
    private Set<TeamFormationTeamJoinRequest> sentTeamJoinRequests;

    @OneToMany(mappedBy = "invitedParticipant")
    @JsonIgnore
    private Set<TeamFormationParticipantInvitation> receivedParticipantInvitations;
}
