import React from 'react';
import { useSelector } from 'react-redux';

import { HeadingActions } from 'components';
import { ChecklistSection, CountdownSection } from './components';
import { HeadingSection, StyledH1 } from 'commonStyles';
import { Roles } from 'security/accessControl';
import { MenuAction, RootState } from 'types';

import listIcon from 'assets/icons/list.svg';
import announcementIcon from 'assets/icons/announcement.svg';
import calendarPlusIcon from 'assets/icons/calendar-plus.svg';

const dashboardActions: MenuAction[] = [
  {
    link: '/admin/applications',
    text: 'Manage Applications',
    type: 'link',
    icon: listIcon
  },
  {
    link: '/announcements/post',
    text: 'Post New Announcement',
    type: 'link',
    icon: announcementIcon
  },
  {
    link: '/events/create',
    text: 'Create New Event',
    type: 'link',
    icon: calendarPlusIcon
  }
];

const Dashboard = (): JSX.Element => {
  const userRole = useSelector((state: RootState) => state.user.role);

  return (
    <>
      <HeadingSection>
        <StyledH1>My Hack Brooklyn</StyledH1>

        {userRole === Roles.Admin && (
          <HeadingActions viewName="Dashboard" actions={dashboardActions} />
        )}
      </HeadingSection>

      <CountdownSection />
      <ChecklistSection />
    </>
  );
};

export default Dashboard;
