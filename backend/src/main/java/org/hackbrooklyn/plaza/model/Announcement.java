package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "announcements")
public class Announcement {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "body", columnDefinition = "TEXT")
    @NotBlank
    private String body;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", referencedColumnName = "id")
    @JsonIgnore
    @NotNull
    private User author;

    @Column(name= "participants_only")
    private boolean participantsOnly;

    @Column(name = "time_created")
    @CreationTimestamp
    private LocalDateTime timeCreated;

    @Column(name = "last_updated")
    @CreationTimestamp
    private LocalDateTime lastUpdated;
}