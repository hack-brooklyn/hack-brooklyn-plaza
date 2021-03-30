package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hackbrooklyn.plaza.serializer.TopicOrSkillSerializer;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "topic_or_skill")
@Getter
@Setter
@RequiredArgsConstructor
@JsonSerialize(using = TopicOrSkillSerializer.class)
public class TopicOrSkill {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank
    @Column(name = "name", unique = true)
    private String name;
}
