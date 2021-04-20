import React from 'react';
import { useSelector } from 'react-redux';

import {
  ApplicationStatusSection,
  ChecklistSection,
  CountdownSection
} from 'views/root/Dashboard/components/PreEvent';
import { AnnouncementBrowser } from 'components/announcements';
import { StyledCenteredMarginH2 } from 'common/styles/commonStyles';
import { acCan, acHasAttributeAccess } from 'util/auth';
import { AnnouncementsAttributes, Resources } from 'security/accessControl';
import { HackathonLinks, RootState } from 'types';

interface PreEventProps {
  links?: HackathonLinks;
}

const PreEvent = (props: PreEventProps): JSX.Element => {
  const { links } = props;

  const userRole = useSelector((state: RootState) => state.user.role);

  const isUserAtLeastParticipant = (): boolean => {
    return acHasAttributeAccess(
      acCan(userRole).readAny(Resources.Announcements),
      [AnnouncementsAttributes.ParticipantsOnly]
    );
  };

  return (
    <>
      {isUserAtLeastParticipant() && <CountdownSection />}
      <ApplicationStatusSection />
      {isUserAtLeastParticipant() && <ChecklistSection links={links} />}

      <section>
        <StyledCenteredMarginH2>What&apos;s New</StyledCenteredMarginH2>
        <AnnouncementBrowser />
      </section>
    </>
  );
};

export default PreEvent;
