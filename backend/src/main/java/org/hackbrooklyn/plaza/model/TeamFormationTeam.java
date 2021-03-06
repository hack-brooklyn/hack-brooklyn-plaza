package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators.PropertyGenerator;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hackbrooklyn.plaza.serializer.TopicOrSkillSetSerializer;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.util.Set;

@Entity
@Table(name = "team_formation_teams")
@JsonIdentityInfo(generator = PropertyGenerator.class, property = "id")
@Getter
@Setter
@RequiredArgsConstructor
public class TeamFormationTeam {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "name", unique = true)
    @NotBlank
    @NotNull
    private String name;

    @Column(name = "size")
    @Min(2)
    @Max(4)
    @NotNull
    private int size;

    @OneToOne
    @JoinColumn(name = "team_leader_id", referencedColumnName = "id")
    @JsonIdentityInfo(generator = PropertyGenerator.class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    private TeamFormationParticipant leader;

    @OneToMany(mappedBy = "team")
    @NotNull
    private Set<TeamFormationParticipant> members;

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
            name = "team_formation_team_topics_and_skills",
            joinColumns = {@JoinColumn(name = "team_id")},
            inverseJoinColumns = {@JoinColumn(name = "topic_or_skill_id")}
    )
    @NotNull
    @JsonSerialize(using = TopicOrSkillSetSerializer.class)
    private Set<TopicOrSkill> interestedTopicsAndSkills;

    @OneToMany(mappedBy = "requestedTeam", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<TeamFormationTeamJoinRequest> receivedTeamJoinRequests;

    @OneToMany(mappedBy = "invitingTeam", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<TeamFormationParticipantInvitation> sentParticipantInvitations;
}
