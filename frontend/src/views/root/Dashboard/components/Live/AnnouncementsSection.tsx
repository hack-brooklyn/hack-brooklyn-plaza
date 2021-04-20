import React from 'react';

import { AnnouncementBrowser } from 'components/announcements';
import { LinkButton } from 'components';
import {
  LiveDashboardHeading,
  LiveDashboardSection
} from 'common/styles/root/dashboardStyles';

const AnnouncementsSection = (): JSX.Element => {
  return (
    <LiveDashboardSection>
      <LiveDashboardHeading>What&apos;s New</LiveDashboardHeading>
      <AnnouncementBrowser limit={5} />
      <LinkButton to="/announcements" centered={true}>
        View All Announcements
      </LinkButton>
    </LiveDashboardSection>
  );
};

export default AnnouncementsSection;
