package org.hackbrooklyn.plaza.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "topic_or_skill")
@Getter
@Setter
@RequiredArgsConstructor
public class TopicOrSkill {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank
    @Column(name = "name", unique = true)
    private String name;
}
