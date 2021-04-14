import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  CreateTeamModal,
  EditParticipantProfileModal,
  EditTeamProfileModal,
  ParticipantInboxModal,
  TeamContactModal,
  TeamInboxModal
} from 'components/teamformation';
import { HeadingActions } from 'components';
import {
  TitleArea,
  VisibilityStatus,
  VisibilityStatusText
} from 'common/styles/teamformation/teamFormationBrowserStyles';
import { HeadingSection, StyledH1 } from 'common/styles/commonStyles';
import { getParticipantData } from 'util/teamFormation';
import { handleError } from 'util/plazaUtils';
import {
  Breakpoints,
  MenuAction,
  RootState,
  TeamFormationParticipant,
  TeamFormationParticipantNotSetUpError,
  TeamFormationTeam
} from 'types';

import browserVisibleIcon from 'assets/icons/team-formation/browser-visible.svg';
import browserHiddenIcon from 'assets/icons/team-formation/browser-hidden.svg';
import createTeamIcon from 'assets/icons/team-formation/create-team.svg';
import mailboxIcon from 'assets/icons/mailbox.svg';
import profileCardIcon from 'assets/icons/profile-card.svg';
import profileCardMultiIcon from 'assets/icons/profile-card-multi.svg';
import listIcon from 'assets/icons/list.svg';

interface ParticipantHeadingContentsProps {
  participantData: TeamFormationParticipant;
}

interface TeamHeadingContentsProps {
  teamData: TeamFormationTeam;
}

const TeamFormationHeadingSection = (): JSX.Element => {
  const history = useHistory();

  const toggleDataRefresh = useSelector(
    (state: RootState) => state.teamFormation.toggleHeadingSectionDataRefresh
  );

  const [
    participantData,
    setParticipantData
  ] = useState<TeamFormationParticipant>();

  useEffect(() => {
    loadHeading().catch((err) => {
      if (!(err instanceof TeamFormationParticipantNotSetUpError)) {
        handleError(err);
      }
    });
  }, [toggleDataRefresh]);

  const loadHeading = async () => {
    const participantData = await getParticipantData(history);
    setParticipantData(participantData);
  };

  if (participantData !== undefined) {
    return (
      <HeadingSection>
        {participantData.team === null ? (
          <ParticipantHeadingContents participantData={participantData} />
        ) : (
          <TeamHeadingContents teamData={participantData.team} />
        )}
      </HeadingSection>
    );
  } else {
    return (
      <HeadingSection>
        <StyledH1>Team Formation</StyledH1>
      </HeadingSection>
    );
  }
};

const ParticipantHeadingContents = (
  props: ParticipantHeadingContentsProps
): JSX.Element => {
  const { participantData } = props;

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const [participantInboxOpen, setParticipantInboxOpen] = useState(false);
  const [
    participantProfileEditorOpen,
    setParticipantProfileEditorOpen
  ] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);

  const participantHeadingActions: MenuAction[] = [
    {
      onClick: () => setParticipantInboxOpen(true),
      text: 'My Inbox',
      type: 'button',
      icon: mailboxIcon
    },
    {
      onClick: () => setParticipantProfileEditorOpen(true),
      text: 'Edit My Profile',
      type: 'button',
      icon: profileCardIcon
    },
    {
      onClick: () => setCreateTeamModalOpen(true),
      text: 'Create Team',
      type: 'button',
      icon: createTeamIcon
    }
  ];

  return (
    <>
      <TitleArea>
        <StyledH1>Team Formation</StyledH1>
        {participantData !== undefined ? (
          <VisibilityStatus>
            {windowWidth > Breakpoints.Large && (
              <>
                {participantData.visibleInBrowser ? (
                  <img src={browserVisibleIcon} alt="Visible in browser icon" />
                ) : (
                  <img src={browserHiddenIcon} alt="Hidden from browser icon" />
                )}
              </>
            )}

            <VisibilityStatusText>
              Your profile is currently
              {participantData.visibleInBrowser
                ? ' visible on '
                : ' hidden from '}
              the participant browser.
            </VisibilityStatusText>
          </VisibilityStatus>
        ) : (
          <VisibilityStatusText>
            Checking profile visibility...
          </VisibilityStatusText>
        )}
      </TitleArea>

      <HeadingActions
        viewName="Team Formation"
        actions={participantHeadingActions}
      />

      <ParticipantInboxModal
        show={participantInboxOpen}
        setShow={setParticipantInboxOpen}
      />
      <EditParticipantProfileModal
        show={participantProfileEditorOpen}
        setShow={setParticipantProfileEditorOpen}
      />
      <CreateTeamModal
        show={createTeamModalOpen}
        setShow={setCreateTeamModalOpen}
      />
    </>
  );
};

const TeamHeadingContents = (props: TeamHeadingContentsProps): JSX.Element => {
  const { teamData } = props;

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const [teamInboxOpen, setTeamInboxOpen] = useState(false);
  const [
    participantProfileEditorOpen,
    setParticipantProfileEditorOpen
  ] = useState(false);
  const [teamProfileEditorOpen, setTeamProfileEditorOpen] = useState(false);
  const [teamContactOpen, setTeamContactOpen] = useState(false);

  const teamHeadingActions: MenuAction[] = [
    {
      onClick: () => setTeamInboxOpen(true),
      text: 'Team Inbox',
      type: 'button',
      icon: mailboxIcon
    },
    {
      onClick: () => setParticipantProfileEditorOpen(true),
      text: 'Edit My Profile',
      type: 'button',
      icon: profileCardIcon
    },
    {
      onClick: () => setTeamProfileEditorOpen(true),
      text: 'Edit Team Profile',
      type: 'button',
      icon: profileCardMultiIcon
    },
    {
      onClick: () => setTeamContactOpen(true),
      text: 'Team Contact Info',
      type: 'button',
      icon: listIcon
    }
  ];

  return (
    <>
      <TitleArea>
        <StyledH1>Team Formation</StyledH1>

        <VisibilityStatus>
          {windowWidth > Breakpoints.Large && (
            <>
              {teamData.visibleInBrowser ? (
                <img src={browserVisibleIcon} alt="Visible in browser icon" />
              ) : (
                <img src={browserHiddenIcon} alt="Hidden from browser icon" />
              )}
            </>
          )}

          <VisibilityStatusText>
            Your team&apos;s profile is currently
            {teamData.visibleInBrowser ? ' visible on ' : ' hidden from '}
            the team browser.
          </VisibilityStatusText>
        </VisibilityStatus>
      </TitleArea>

      <HeadingActions viewName="Team Formation" actions={teamHeadingActions} />

      <TeamInboxModal show={teamInboxOpen} setShow={setTeamInboxOpen} />
      <EditParticipantProfileModal
        show={participantProfileEditorOpen}
        setShow={setParticipantProfileEditorOpen}
      />
      <EditTeamProfileModal
        show={teamProfileEditorOpen}
        setShow={setTeamProfileEditorOpen}
      />
      <TeamContactModal show={teamContactOpen} setShow={setTeamContactOpen} />
    </>
  );
};

export default TeamFormationHeadingSection;
