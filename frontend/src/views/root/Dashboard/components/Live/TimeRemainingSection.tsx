import React from 'react';
import Countdown from 'react-countdown';
import styled from 'styled-components/macro';

import {
  LiveDashboardHeading,
  LiveDashboardSection
} from 'common/styles/root/dashboardStyles';
import { Breakpoints } from 'types';
import { HACKATHON_END_DATE_TIME } from 'index';

const TimeRemainingSection = (): JSX.Element => {
  return (
    <LiveDashboardSection>
      <LiveDashboardHeading>Time Remaining</LiveDashboardHeading>

      <TimeRemainingText>
        <Countdown
          date={new Date(HACKATHON_END_DATE_TIME)}
          zeroPadTime={2}
          daysInHours={true}
        />
      </TimeRemainingText>
    </LiveDashboardSection>
  );
};

const TimeRemainingText = styled.div`
  margin-top: -1rem;
  font-size: 3.75rem;
  font-weight: 600;
  text-align: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-top: -2rem;
    font-size: 6rem;
    text-align: left;
  }
`;

export default TimeRemainingSection;
