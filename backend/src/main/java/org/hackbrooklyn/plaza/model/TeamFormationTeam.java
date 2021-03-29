package org.hackbrooklyn.plaza.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Set;

@Entity
@Table(name = "team_formation_team")
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
    private Set<TopicOrSkill> interestedTopicsAndSkills;
}
