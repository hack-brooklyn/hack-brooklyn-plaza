import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { TeamInboxModal } from 'components/teamformation';
import { HeadingActions } from 'components';
import {
  TitleArea,
  VisibilityStatus,
  VisibilityStatusText
} from 'common/styles/teamformation/teamFormationBrowserStyles';
import { HeadingSection, StyledH1 } from 'common/styles/commonStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';
import {
  Breakpoints,
  ConnectionError,
  InvalidSubmittedDataError,
  MenuAction,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  TeamFormationTeam,
  UnknownError
} from 'types';

import browserVisibleIcon from 'assets/icons/team-formation/browser-visible.svg';
import browserHiddenIcon from 'assets/icons/team-formation/browser-hidden.svg';
import mailboxIcon from 'assets/icons/mailbox.svg';

interface ParticipantHeadingContentsProps {
  participantData: TeamFormationParticipant;
}

interface TeamHeadingContentsProps {
  teamData: TeamFormationTeam;
}

const TeamFormationHeadingSection = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [
    participantData,
    setParticipantData
  ] = useState<TeamFormationParticipant>();

  useEffect(() => {
    getParticipantData().catch((err) => handleError(err));
  }, []);

  const getParticipantData = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/teamFormation/participants/userData`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody = await res.json();
      setParticipantData(resBody);
    } else if (res.status === 404) {
      history.push('/teamformation');
    } else if (res.status === 400) {
      throw new InvalidSubmittedDataError();
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getParticipantData(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <HeadingSection>
      {participantData !== undefined && (
        <>
          {participantData.team === null ? (
            <ParticipantHeadingContents participantData={participantData} />
          ) : (
            <TeamHeadingContents teamData={participantData.team} />
          )}
        </>
      )}
    </HeadingSection>
  );
};

const ParticipantHeadingContents = (
  props: ParticipantHeadingContentsProps
): JSX.Element => {
  const { participantData } = props;

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  return (
    <>
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
    </>
  );
};

const TeamHeadingContents = (props: TeamHeadingContentsProps): JSX.Element => {
  const { teamData } = props;

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const [teamInboxOpen, setTeamInboxOpen] = useState(false);

  const teamHeadingActions: MenuAction[] = [
    {
      onClick: () => setTeamInboxOpen(true),
      text: 'Inbox',
      type: 'button',
      icon: mailboxIcon
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

      <HeadingActions viewName="Dashboard" actions={teamHeadingActions} />

      <TeamInboxModal show={teamInboxOpen} setShow={setTeamInboxOpen} />
    </>
  );
};

export default TeamFormationHeadingSection;
