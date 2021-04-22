import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled from 'styled-components/macro';

import { ActionLink } from './components';
import { APPLICATIONS_ACTIVE } from 'index';
import { Breakpoints } from 'types';

const Landing = (): JSX.Element => {
  return (
    <>
      <LandingHeading>Welcome to Hack Brooklyn Plaza.</LandingHeading>
      <WelcomeParagraph>
        Hack Brooklyn Plaza is the digital platform for Hack Brooklyn that makes
        it easy for participants to find or build a team to work with, create a
        personalized event schedule, request mentorship for their projects, and
        more.
      </WelcomeParagraph>
      <StyledRow>
        <StyledCol md>
          <ActionLink
            name="Log&nbsp;In"
            description="Have an account already? Click here to log into Hack Brooklyn Plaza."
            link="/login"
          />
        </StyledCol>

        {APPLICATIONS_ACTIVE && (
          <StyledCol md>
            <ActionLink
              name="Apply"
              description="Haven’t applied yet? Click here to learn more about Brooklyn College’s premier collegiate hackathon and apply now."
              link="/apply"
            />
          </StyledCol>
        )}

        <StyledCol md>
          <ActionLink
            name="Activate"
            description="Already applied? Click here to activate your account and access Hack Brooklyn Plaza."
            link="/activate"
          />
        </StyledCol>
      </StyledRow>
    </>
  );
};

const LandingHeading = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    font-size: 3rem;
    margin-top: 10rem;
  }
`;

const WelcomeParagraph = styled.p`
  font-size: 1.3rem;
  text-align: center;
  margin: 0 auto 3rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    font-size: 1.5rem;
    max-width: 65%;
  }
`;

const StyledRow = styled(Row)`
  margin: 0 auto;
  max-width: ${Breakpoints.Large}px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 0;
  }
`;

export default Landing;
