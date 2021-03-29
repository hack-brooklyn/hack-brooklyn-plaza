package org.hackbrooklyn.plaza.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Set;

@Entity
@Table(name = "team_formation_participants")
@Getter
@Setter
@RequiredArgsConstructor
public class TeamFormationParticipant {

    @Id
    @Column(name = "participant_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int participantId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @NotNull
    private User user;

    @Column(name = "specialization")
    @NotBlank
    @NotNull
    private String specialization;

    @Column(name = "objective_statement")
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
    private Set<TopicOrSkill> interestedTopicsAndSkills;
}
