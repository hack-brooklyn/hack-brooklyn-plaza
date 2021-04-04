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

interface AnnouncementProps {
  body: string;
  lastUpdated: string;
  timeCreated: string;
  displayControls: boolean;
  id: number;
  toggleRefresh: () => void;
}

dayjs.extend(relativeTime);
dayjs.extend(utc);

const Announcement = (props: AnnouncementProps): JSX.Element => {
  const {
    body,
    lastUpdated,
    timeCreated,
    displayControls,
    id,
    toggleRefresh
  } = props;

  const history = useHistory();
  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const confirmDeleteAnnouncement = async () => {
    if (confirm('Are you sure you want to delete?')) {
      try {
        await deleteAnnouncement();
        toast.success('Successfully deleted an announcement');
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
            `Updated: ${dayjs.utc(lastUpdated).fromNow()}`}
          {timeCreated !== lastUpdated &&
            (windowWidth < Breakpoints.Small ? <br /> : ' | ')}
          Created: {dayjs.utc(lastUpdated).fromNow()}
        </BoldText>
        {displayControls && (
          <ControlContainer>
            <StyledAnchor to={`/announcements/${id}/edit`}>
              <ButtonIcon src={editIcon} alt={'Edit Icon'} />
            </StyledAnchor>
            <StyledAnchor to={'/announcements'}>
              <ButtonIcon
                src={deleteIcon}
                alt={'Delete Icon'}
                onClick={confirmDeleteAnnouncement}
              />
            </StyledAnchor>
          </ControlContainer>
        )}
      </Container>
    </AnnouncementContainer>
  );
};

interface LinkProps {
  href: string;
  children: React.ReactNode;
}

const LinkRenderer = (props: LinkProps) => {
  const { href, children } = props;
  return (
    <a href={href} rel="noreferrer" target="_blank">
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

const BodyText = styled.p`
  width: 100%;
  word-break: break-word;
  font-size: 1.1rem;
`;

const BoldText = styled.p`
  font-weight: bold;
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

const ButtonIcon = styled.img``;

const LinkStyles = css`
  margin: 0.8rem;
`;

const StyledAnchor = styled(Link)`
  ${LinkStyles}
`;

export default Announcement;
