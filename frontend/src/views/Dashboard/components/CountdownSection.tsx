import React from 'react';
import styled from 'styled-components/macro';
import Countdown, { CountdownRenderProps } from 'react-countdown';

import { StyledH2 } from 'commonStyles';
import { Breakpoints } from 'types';

const CountdownSection = (): JSX.Element => {
  return (
    <StyledSection>
      <StyledH2>Hacking Begins In</StyledH2>
      <Countdown date={new Date('April 23, 2021 6:00 PM')} renderer={countdownRenderer} />
    </StyledSection>
  );
};

const countdownRenderer = (props: CountdownRenderProps): JSX.Element => {
  const { days, hours, minutes, seconds, completed } = props;

  if (completed) {
    return <div>Hack Brooklyn is now live!</div>;
  } else {
    return (
      <div role="text">
        <DaysRemainingText>{days} days</DaysRemainingText>
        <HMSRemainingText>{hours} hours, {minutes} minutes, and {seconds} seconds</HMSRemainingText>
      </div>
    );
  }
};

const StyledSection = styled.section`
  text-align: center;
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-top: 4rem;
    margin-bottom: 4rem;
  }
`;

const DaysRemainingText = styled.div`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: -0.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 4rem;
    margin-bottom: -0.75rem;
  }
`;

const HMSRemainingText = styled.div`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 3rem;
  }
`;

export default CountdownSection;
