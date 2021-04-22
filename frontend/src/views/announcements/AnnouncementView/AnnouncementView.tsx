import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { AnnouncementBrowser } from 'components/announcements';
import { HeadingActions } from 'components';
import { HeadingSection, StyledH1 } from 'common/styles/commonStyles';
import ac, { Resources } from 'security/accessControl';
import { MenuAction, RootState } from 'types';

import postIcon from 'assets/icons/penWhite.svg';

const announcementActions: MenuAction[] = [
  {
    link: '/announcements/post',
    text: 'Post New',
    type: 'link',
    icon: postIcon
  }
];

const AnnouncementView = (): JSX.Element => {
  const userRole = useSelector((state: RootState) => state.user.role);

  const [isAbleToModify, setIsAbleToModify] = useState(false);

  useEffect(() => {
    setIsAbleToModify(checkIfAbleToModify());
  }, [userRole]);

  const checkIfAbleToModify = (): boolean => {
    if (userRole !== null) {
      return ac.can(userRole).createAny(Resources.Announcements).granted;
    }

    return false;
  };

  return (
    <>
      <HeadingSection>
        <StyledH1>Announcements</StyledH1>

        {isAbleToModify && (
          <HeadingActions
            viewName="Announcement"
            actions={announcementActions}
          />
        )}
      </HeadingSection>
      <AnnouncementBrowser isAbleToModify={isAbleToModify} narrow />
    </>
  );
};

export default AnnouncementView;
