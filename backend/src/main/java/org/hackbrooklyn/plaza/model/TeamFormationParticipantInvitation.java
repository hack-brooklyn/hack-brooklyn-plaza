package org.hackbrooklyn.plaza.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "team_formation_participant_invitations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"invited_participant_id", "inviting_team_id"})
})
@Getter
@Setter
@RequiredArgsConstructor
public class TeamFormationParticipantInvitation {

    @Id
    @Column(name = "invitation_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int invitationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_participant_id", referencedColumnName = "id")
    @NotNull
    @JsonIgnore
    private TeamFormationParticipant invitedParticipant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviting_team_id", referencedColumnName = "id")
    @NotNull
    private TeamFormationTeam invitingTeam;

    @Column(name = "message", columnDefinition = "TEXT")
    @Size(min = 1, max = 500)
    @NotBlank
    @NotNull
    private String message;

    @Column(name = "invitation_accepted")
    private Boolean invitationAccepted;

    @Column(name = "invitation_timestamp")
    @CreationTimestamp
    private LocalDateTime invitationTimestamp;
}
