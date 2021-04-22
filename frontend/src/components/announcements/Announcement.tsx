import React from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router';
import styled, { css } from 'styled-components/macro';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

import { API_ROOT } from 'index';
import {
  Announcement as IAnnouncement,
  Breakpoints,
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import editIcon from 'assets/icons/penBlack.svg';
import deleteIcon from 'assets/icons/trashIcon.svg';

interface AnnouncementProps extends IAnnouncement {
  displayControls: boolean;
  toggleRefresh: () => void;
}

interface LinkProps {
  href: string;
  children: React.ReactNode;
}

dayjs.extend(relativeTime);
dayjs.extend(utc);

const Announcement = (props: AnnouncementProps): JSX.Element => {
  const {
    id,
    body,
    lastUpdated,
    timeCreated,
    displayControls,
    toggleRefresh
  } = props;

  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const history = useHistory();
  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const confirmDeleteAnnouncement = async () => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement();
        toast.success('The announcement has been deleted.');
        toggleRefresh();
      } catch (err) {
        handleError(err);
      }
    }
  };

  const deleteAnnouncement = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return;
    } else if (res.status === 401) {
      const refreshToken = await refreshAccessToken(history);
      await deleteAnnouncement(refreshToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <AnnouncementContainer>
      <BodyText>
        <ReactMarkdown skipHtml={true} renderers={{ link: LinkRenderer }}>
          {body}
        </ReactMarkdown>
      </BodyText>
      <Container>
        <BoldText>
          {timeCreated !== lastUpdated &&
            `Updated ${dayjs.utc(lastUpdated).fromNow()}`}
          {timeCreated !== lastUpdated &&
            (windowWidth < Breakpoints.Small ? <br /> : ' | ')}
          Posted {dayjs.utc(timeCreated).fromNow()}
        </BoldText>
        {displayControls && (
          <ControlContainer>
            <StyledAnchor to={`/announcements/${id}/edit`}>
              <ButtonIcon src={editIcon} alt="Edit Announcement" />
            </StyledAnchor>
            <StyledAnchor to="/announcements">
              <ButtonIcon
                src={deleteIcon}
                alt="Delete Announcement"
                onClick={confirmDeleteAnnouncement}
              />
            </StyledAnchor>
          </ControlContainer>
        )}
      </Container>
    </AnnouncementContainer>
  );
};

const LinkRenderer = (props: LinkProps) => {
  const { href, children } = props;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

const AnnouncementContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;

  &:last-child {
    border: none;
  }
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;

const ControlContainer = styled.div`
  @media (max-width: ${Breakpoints.Small}px) {
    justify-self: flex-end;
    display: flex;
  }
`;

const BodyText = styled.div`
  width: 100%;
  margin-bottom: 0;
  font-size: 1.1rem;

  img {
    display: block;
    margin: 0 auto;
    width: 75%;
  }
`;

const BoldText = styled.p`
  font-weight: bold;
  align-self: flex-end;
`;

const ButtonIcon = styled.img``;

const LinkStyles = css`
  margin: 0.8rem;
`;

const StyledAnchor = styled(Link)`
  ${LinkStyles}
`;

export default Announcement;
