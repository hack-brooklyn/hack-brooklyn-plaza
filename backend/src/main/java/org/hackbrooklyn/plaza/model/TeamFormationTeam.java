package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
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

    @OneToMany(mappedBy = "team")
    @NotNull
    @JsonIdentityInfo(generator = PropertyGenerator.class, property = "id")
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
}
