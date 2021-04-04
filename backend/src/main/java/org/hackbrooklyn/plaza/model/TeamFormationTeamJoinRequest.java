package org.hackbrooklyn.plaza.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_formation_team_join_requests", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"requested_team_id", "requesting_participant_id"})
})
@Getter
@Setter
@RequiredArgsConstructor
public class TeamFormationTeamJoinRequest {

    @Id
    @Column(name = "request_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_team_id", referencedColumnName = "id")
    @NotNull
    private TeamFormationTeam requestedTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requesting_participant_id", referencedColumnName = "id")
    @NotNull
    private TeamFormationParticipant requestingParticipant;

    @Column(name = "message", columnDefinition = "TEXT")
    @Size(min = 1, max = 500)
    @NotBlank
    @NotNull
    private String message;

    @Column(name = "request_accepted")
    private Boolean requestAccepted;

    @Column(name = "request_timestamp")
    @CreationTimestamp
    private LocalDateTime requestTimestamp;
}
