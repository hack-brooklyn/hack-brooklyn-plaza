import React from 'react';
import styled from 'styled-components/macro';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

interface AnnouncementProps {
  body: string;
  lastUpdated: string;
}

dayjs.extend(relativeTime);

const Announcement = (props: AnnouncementProps): JSX.Element => {
  const { body, lastUpdated } = props;

  return (
    <AnnouncementContainer>
      <BodyText>{body}</BodyText>
      <LastUpdatedText>{dayjs(lastUpdated).fromNow()}</LastUpdatedText>
    </AnnouncementContainer>
  );
};

export default Announcement;

const AnnouncementContainer = styled.div`
  &:last-child {
    border: none;
  }

  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const BodyText = styled.p`
  font-size: 1.1rem;
`;

const LastUpdatedText = styled.p`
  font-weight: bold;
`;
