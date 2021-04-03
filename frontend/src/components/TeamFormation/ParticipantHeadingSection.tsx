import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  TitleArea,
  VisibilityStatus,
  VisibilityStatusText
} from 'common/styles/teamFormationBrowserStyles';
import { HeadingSection, StyledH1 } from 'commonStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';
import {
  Breakpoints,
  ConnectionError,
  InvalidSubmittedDataError,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  UnknownError
} from 'types';

import browserVisibleIcon from 'assets/icons/team-formation/browser-visible.svg';
import browserHiddenIcon from 'assets/icons/team-formation/browser-hidden.svg';

const ParticipantHeadingSection = (): JSX.Element => {
  const history = useHistory();

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);
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
    </HeadingSection>
  );
};

export default ParticipantHeadingSection;
