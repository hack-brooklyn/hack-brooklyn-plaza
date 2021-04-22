import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Live, PreEvent } from './components';
import { HeadingActions } from 'components';
import { HeadingSection, StyledH1 } from 'common/styles/commonStyles';
import { handleError } from 'util/plazaUtils';
import { acCan, acHasAttributeAccess, refreshAccessToken } from 'util/auth';
import {
  AnnouncementsAttributes,
  Resources,
  Roles
} from 'security/accessControl';
import {
  ConnectionError,
  HackathonLinks,
  MenuAction,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT, HAS_HACKATHON_STARTED } from 'index';

import discordIcon from 'assets/icons/discord.svg';
import devpostIcon from 'assets/icons/devpost.svg';
import bookIcon from 'assets/icons/book.svg';
import listIcon from 'assets/icons/list.svg';
import announcementIcon from 'assets/icons/announcement.svg';
import calendarPlusIcon from 'assets/icons/calendar-plus.svg';

const adminActions: MenuAction[] = [
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
    link: '/schedule/create',
    text: 'Create New Event',
    type: 'link',
    icon: calendarPlusIcon
  }
];

const Dashboard = (): JSX.Element => {
  const history = useHistory();

  const userRole = useSelector((state: RootState) => state.user.role);
  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [links, setLinks] = useState<HackathonLinks>();

  useEffect(() => {
    if (isUserAtLeastParticipant()) {
      getDashboardLinks().catch((err) => handleError(err));
    }
  }, []);

  const getDashboardLinks = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/checklistLinks`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: HackathonLinks = await res.json();
      setLinks(resBody);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getDashboardLinks(refreshedToken);
    } else if (res.status === 403) {
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const isUserAtLeastParticipant = (): boolean => {
    return acHasAttributeAccess(
      acCan(userRole).readAny(Resources.Announcements),
      [AnnouncementsAttributes.ParticipantsOnly]
    );
  };

  const participantActions: MenuAction[] = [
    {
      link: links?.discordUrl,
      text: 'Discord',
      type: 'anchor',
      icon: discordIcon
    },
    {
      link: links?.devpostUrl,
      text: 'Devpost',
      type: 'anchor',
      icon: devpostIcon
    },
    {
      link: links?.guideUrl,
      text: 'Guide',
      type: 'anchor',
      icon: bookIcon
    }
  ];

  return (
    <>
      <HeadingSection>
        <StyledH1>My Hack Brooklyn</StyledH1>

        <HeadingActions
          viewName="Dashboard"
          actions={
            userRole === Roles.Admin
              ? adminActions.concat(participantActions)
              : participantActions
          }
        />
      </HeadingSection>

      {isUserAtLeastParticipant() && HAS_HACKATHON_STARTED ? (
        <Live />
      ) : (
        <PreEvent links={links} />
      )}
    </>
  );
};

export default Dashboard;
