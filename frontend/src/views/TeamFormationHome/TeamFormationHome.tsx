import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { StyledCenteredH2, StyledH1 } from 'commonStyles';
import { Breakpoints } from 'types';

import lookingForTeamIcon from 'assets/icons/team-formation/looking-for-team.svg';
import haveATeamIcon from 'assets/icons/team-formation/have-a-team.svg';

const TeamFormationHome = (): JSX.Element => {
  return (
    <>
      <StyledH1>Team Formation</StyledH1>

      <WelcomeTextSection>
        <StyledCenteredH2>Welcome to Team Formation!</StyledCenteredH2>
        <StyledP>
          Team formation makes it easy to find a team to work with or to find
          new members for your current team.
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
                I don’t have a team yet and am looking for a team to join
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
