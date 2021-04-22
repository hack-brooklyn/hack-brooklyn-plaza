import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';

import { ScheduleViewer } from 'components/schedule';
import { LinkButton } from 'components';
import {
  LiveDashboardHeading,
  LiveDashboardSection
} from 'common/styles/root/dashboardStyles';
import { Breakpoints } from 'types';

const ScheduleSection = (): JSX.Element => {
  const history = useHistory();

  return (
    <ScheduleViewerSection>
      <ScheduleHeading>My Schedule</ScheduleHeading>

      <ScheduleViewer
        selectEvent={(event) => history.push(`/schedule/${event.id}`)}
        savedOnly={true}
        showSaveButton={false}
      />

      <Directions>
        <div>
          <DirectionText>
            To find and add events to your schedule, visit the Schedule Builder
            by clicking the button below.
          </DirectionText>

          <DirectionText>
            You will receive push notifications for each event in your schedule
            when they&apos;re about to begin.
          </DirectionText>
        </div>

        <LinkButton to="/schedule" centered={true}>
          Go to Schedule Builder
        </LinkButton>
      </Directions>
    </ScheduleViewerSection>
  );
};

const ScheduleHeading = styled(LiveDashboardHeading)`
  margin-bottom: 0.25rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-left: 0.5rem;
    margin-bottom: 0;
  }
`;

const ScheduleViewerSection = styled(LiveDashboardSection)`
  @media screen and (min-width: ${Breakpoints.Large}px) {
    max-width: 29.375rem;
    margin-left: auto;
  }
`;

const Directions = styled.div`
  margin: -8rem auto 1.5rem;
  text-align: center;
  font-size: 1.1rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    max-width: 600px;
  }

  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    padding-left: 0.5rem;
  }
`;

const DirectionText = styled.p`
  max-width: 90%;
  margin: 0 auto 0.5rem;

  &:last-child {
    margin-bottom: 1.25rem;
  }

  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    max-width: 25rem;
  }
`;

export default ScheduleSection;
