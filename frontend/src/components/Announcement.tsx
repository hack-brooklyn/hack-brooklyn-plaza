import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'react-toastify';

import { API_ROOT } from '../index';
import { RootState } from '../types';
import { handleError } from '../util/plazaUtils';
import penBlackIcon from 'assets/icons/penBlack.svg';
import trashIcon from 'assets/icons/trashIcon.svg';

interface AnnouncementProps {
  body: string;
  lastUpdated: string;
  displayControls: boolean;
  id: number;
  toggleRefresh: () => void;
}

dayjs.extend(relativeTime);

const Announcement = (props: AnnouncementProps): JSX.Element => {
  const { body, lastUpdated, displayControls, id, toggleRefresh } = props;

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const deleteAnnouncement = async () => {
    if (confirm('Are you sure?')) {
      try {
        await fetch(`${API_ROOT}/announcements/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        toast.success('Successfully deleted an announcement');
      } catch (err) {
        handleError(err);
      } finally {
        toggleRefresh();
      }
    }
  };

  return (
    <AnnouncementContainer>
      <BodyText>{body}</BodyText>
      <LastUpdatedText>{dayjs(lastUpdated).fromNow()}</LastUpdatedText>
      {displayControls && (
        <ControlContainer>
          <StyledAnchor to={`/announcements/${id}/edit`}>
            <ButtonIcon src={penBlackIcon} alt={'Pen Icon'} />
          </StyledAnchor>
          <StyledAnchor to={'/announcements'}>
            <ButtonIcon
              src={trashIcon}
              alt={'Trash Icon'}
              onClick={deleteAnnouncement}
            />
          </StyledAnchor>
        </ControlContainer>
      )}
    </AnnouncementContainer>
  );
};

const AnnouncementContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;

  &:last-child {
    border: none;
  }
`;

const BodyText = styled.p`
  font-size: 1.1rem;
`;

const LastUpdatedText = styled.p`
  font-weight: bold;
`;

const ControlContainer = styled.div``;

const ButtonIcon = styled.img``;

const LinkStyles = css`
  margin: 0.8rem;
`;

const StyledAnchor = styled(Link)`
  ${LinkStyles}
`;

export default Announcement;
