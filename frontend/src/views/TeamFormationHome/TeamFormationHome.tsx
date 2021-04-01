import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { StyledCenteredH2, StyledH1 } from 'commonStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';
import {
  Breakpoints,
  ConnectionError,
  NoPermissionError,
  RootState,
  TeamFormationParticipant,
  UnknownError
} from 'types';

import lookingForTeamIcon from 'assets/icons/team-formation/looking-for-team.svg';
import haveATeamIcon from 'assets/icons/team-formation/have-a-team.svg';

const TeamFormationHome = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const [initialSetupVisible, setInitialSetupVisible] = useState(false);

  useEffect(() => {
    checkParticipantTeamStatus().catch((err) => handleError(err));
  }, []);

  const checkParticipantTeamStatus = async (overriddenAccessToken?: string) => {
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
      // If we get back 200 OK, the user has already gone through initial setup
      // Redirect the user to the appropriate view
      const resBody: TeamFormationParticipant = await res.json();

      if (resBody.team === null) {
        // User has no team and is looking for a team, redirect to the team browser
        history.push('/teamformation/teams');
      } else {
        // User has a team and is looking for participants, redirect to the participant browser
        history.push('/teamformation/participants');
      }
    } else if (res.status === 404) {
      // If we get back 404 Not Found, stay on the page so the user can perform initial setup.
      setInitialSetupVisible(true);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await checkParticipantTeamStatus(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <>
      <StyledH1>Team Formation</StyledH1>

      {initialSetupVisible && (
        <>
          <WelcomeTextSection>
            <StyledCenteredH2>Welcome to Team Formation!</StyledCenteredH2>
            <StyledP>
              Team formation makes it easy to find a team to work with or to
              find new members for your current team.
            </StyledP>

            <StyledP>
              To start, select the option that best describes your current
              situation.
            </StyledP>
          </WelcomeTextSection>

          <OptionsSection>
            <Row>
              <Col md={6}>
                <Option to="/teamformation/participants/setup">
                  <OptionIcon
                    src={lookingForTeamIcon}
                    alt="I am looking for a team"
                  />
                  <OptionDescription>
                    I don’t have a team yet and am currently looking for a team
                    to join
                  </OptionDescription>
                </Option>
              </Col>

              <Col md={6}>
                <Option to="/teamformation/teams/setup">
                  <OptionIcon src={haveATeamIcon} alt="I have a team" />
                  <OptionDescription>
                    I have a team/want to create a new team and am looking for
                    members
                  </OptionDescription>
                </Option>
              </Col>
            </Row>
          </OptionsSection>
        </>
      )}
    </>
  );
};

const WelcomeTextSection = styled.section`
  margin: 2rem auto 4rem;
  max-width: 800px;
`;

const StyledP = styled.p`
  text-align: center;
  font-size: 1.25rem;
  max-width: 600px;
  margin: 1rem auto 2rem;
`;

const OptionsSection = styled.section`
  margin: 0 auto;
  max-width: 1000px;
`;

const Option = styled(Link)`
  display: block;
  text-decoration: none;
  margin: 0 auto 4rem;
  color: black;
  transition: 0.175s;
  transition-timing-function: ease-in-out;

  &:hover {
    color: #0d6efd;
  }

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 0;
  }
`;

const OptionIcon = styled.img`
  margin: 0 auto 1rem;
  display: block;
  height: 12rem;
  width: 12rem;
`;

const OptionDescription = styled.div`
  max-width: 300px;
  margin: 0 auto;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
`;

export default TeamFormationHome;
