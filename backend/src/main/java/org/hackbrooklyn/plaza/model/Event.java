package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import org.hackbrooklyn.plaza.serializer.LocalDateTimeWithUTCSerializer;
import org.hibernate.validator.constraints.URL;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "events")
public class Event {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "title")
    @NotBlank
    private String title;

    @Column(name = "presenters")
    @ElementCollection
    private List<@NotBlank String> presenters;

    @Column(name = "start_time")
    @JsonSerialize(using = LocalDateTimeWithUTCSerializer.class)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    @JsonSerialize(using = LocalDateTimeWithUTCSerializer.class)
    private LocalDateTime endTime;

    @Column(name = "description", columnDefinition = "TEXT")
    @NotBlank
    private String description;

    @Column(name = "external_link")
    @URL
    private String externalLink;

}
