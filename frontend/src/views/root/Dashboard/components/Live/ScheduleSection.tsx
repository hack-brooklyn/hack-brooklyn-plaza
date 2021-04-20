import React from 'react';
import styled from 'styled-components/macro';

import { LinkButton } from 'components';
import {
  LiveDashboardHeading,
  LiveDashboardSection
} from 'common/styles/root/dashboardStyles';
import { Breakpoints } from 'types';

const ScheduleSection = (): JSX.Element => {
  return (
    <LiveDashboardSection>
      <LiveDashboardHeading>My Schedule</LiveDashboardHeading>

      {/* TODO: Add personalized schedule section */}
      {/* Awaiting completion of the schedule builder */}

      {/* TODO: Conditionally render this if the user's schedule is empty */}
      <EmptyScheduleNotice>
        <p>
          Your personal schedule is empty! Go to the Schedule Builder to find
          and add events to your schedule.
        </p>
        <p>
          You will be able to receive push notifications for events added to
          your personal schedule.
        </p>
      </EmptyScheduleNotice>

      <LinkButton to="/schedule" centered={true}>
        Go to Schedule Builder
      </LinkButton>
    </LiveDashboardSection>
  );
};

const EmptyScheduleNotice = styled.div`
  margin: 1.5rem auto 2rem;
  text-align: center;
  font-size: 1.1rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    max-width: 70%;
  }
`;

export default ScheduleSection;
