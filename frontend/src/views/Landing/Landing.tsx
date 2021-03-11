import React from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components/macro';

import { ActionLink } from './components';

const Landing = (): JSX.Element => {

  return (
    <>
      <StyledH1>Welcome to Hack Brooklyn Plaza.</StyledH1>
      <WelcomeParagraph>
        Hack Brooklyn Plaza is the digital platform for Hack Brooklyn that makes it
        easy for participants to find or build a team to work with, create a personalized
        event schedule, request mentorship for their projects, and more.
      </WelcomeParagraph>
      <StyledRow>
        <Col>
          <ActionLink name="Log&nbsp;In"
                      description="Have an account already? Click here to log into Hack Brooklyn Plaza."
                      link="/login" />
        </Col>
        <Col>
          <ActionLink name="Apply"
                      description="Haven’t applied yet? Click here to learn more about Brooklyn College’s premier collegiate hackathon and apply now."
                      link="/apply" />
        </Col>
        <Col>
          <ActionLink name="Activate"
                      description="Already accepted to Hack Brooklyn? Click here to activate your account and access Hack Brooklyn Plaza."
                      link="/activate" />
        </Col>
      </StyledRow>
    </>
  );
};

const StyledH1 = styled.h1`
  text-align: center;
  font-size: 3rem;
  margin-bottom: 2rem;
`;

const WelcomeParagraph = styled.p`
  text-align: center;
  margin: 0 auto 3rem;
  max-width: 65%;
  font-size: 1.5rem;
`;

const StyledRow = styled(Row)`
  margin: 0 auto;
  max-width: 1000px;
`;

export default Landing;
