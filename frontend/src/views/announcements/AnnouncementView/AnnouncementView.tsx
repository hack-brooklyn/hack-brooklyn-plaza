import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { AnnouncementBrowser } from 'components/announcements';
import { HeadingSection, StyledH1 } from 'common/styles/commonStyles';
import ac, { Resources } from 'security/accessControl';
import { RootState } from 'types';

import postIcon from 'assets/icons/penWhite.svg';
import { HeadingButton } from 'components';

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
          <HeadingButton
            type={'link'}
            icon={postIcon}
            text={'Post New'}
            link={'/announcements/post'}
            onClick={() => {
              return null;
            }}
          />
        )}
      </HeadingSection>
      <AnnouncementBrowser isAbleToModify={isAbleToModify} />
    </>
  );
};

export default AnnouncementView;
