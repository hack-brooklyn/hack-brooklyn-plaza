import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';

import { StyledH2, StyledH3 } from 'common/styles/commonStyles';
import { refreshAccessToken } from 'util/auth';
import { handleError } from 'util/plazaUtils';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';

interface ChecklistLinks {
  discordUrl: string;
  devpostUrl: string;
}

interface ChecklistItemProps {
  type: 'anchor' | 'link' | 'button';
  name: string;
  buttonText: string;
  buttonLink?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const ChecklistSection = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );

  const [checklistLinks, setChecklistLinks] = useState<ChecklistLinks | null>(
    null
  );
  const [sectionReady, setSectionReady] = useState(false);

  useEffect(() => {
    getChecklistLinks().catch((err) => handleError(err));
  }, []);

  const getChecklistLinks = async (overriddenAccessToken?: string) => {
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
      const resBody: ChecklistLinks = await res.json();
      setChecklistLinks(resBody);
      setSectionReady(true);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getChecklistLinks(refreshedToken);
    } else if (res.status === 403) {
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  if (sectionReady && checklistLinks !== null) {
    return (
      <StyledSection>
        <StyledH2>Pre-Hackathon Checklist</StyledH2>

        <ChecklistUL>
          <ChecklistItem
            type="anchor"
            name="1. Join the Hack Brooklyn Discord server"
            buttonText="Join Discord Server"
            buttonLink={checklistLinks.discordUrl}
          >
            Most of the hackathon’s action will take place on the Hack Brooklyn
            Discord server. Make sure to join the Discord server so you don’t
            miss any exciting news and events.
          </ChecklistItem>

          <ChecklistItem
            type="link"
            name="2. Find a team to work with"
            buttonText="Enter Team Formation"
            buttonLink="/teamformation"
          >
            No team? No problem! Head over to <strong>Team Formation</strong>{' '}
            now to browse teams looking for new members, find like-minded
            participants to work with, and assemble your dream team.
          </ChecklistItem>

          {/* Enable when the event builder is ready */}
          {/*<ChecklistItem type="link"*/}
          {/*               name="3. Build your custom event schedule"*/}
          {/*               buttonText="Build Your Schedule"*/}
          {/*               buttonLink="/schedule">*/}
          {/*  Browse the agenda to discover exciting workshops and events happening throughout the hackathon, and build*/}
          {/*  your own personalized schedule to get notifications when they happen!*/}
          {/*</ChecklistItem>*/}

          <ChecklistItem
            type="anchor"
            name="3. Register for the hackathon on Devpost"
            buttonText="Register on Devpost"
            buttonLink={checklistLinks.devpostUrl}
          >
            Projects will be submitted for judging on Devpost. Register for the
            hackathon on Devpost with your team to be eligible to compete for a
            prize!
          </ChecklistItem>

          {/* May not need Hopin */}
          {/*<ChecklistItem*/}
          {/*  type="anchor"*/}
          {/*  name="4. Claim your Hopin ticket"*/}
          {/*  buttonText="Claim Hopin Ticket"*/}
          {/*  buttonLink="https://hopin.com"*/}
          {/*>*/}
          {/*  Some of the hackathon’s activities will take place on Hopin,*/}
          {/*  including speed networking, sponsor booth visits, and select*/}
          {/*  workshops. Claim your free ticket now to gain full access!*/}
          {/*</ChecklistItem>*/}
        </ChecklistUL>
      </StyledSection>
    );
  } else {
    return <></>;
  }
};

export const ChecklistItem = (props: ChecklistItemProps): JSX.Element => {
  const { type, name, buttonText, buttonLink, onClick, children } = props;
  return (
    <ChecklistLI>
      <article>
        <StyledH3>{name}</StyledH3>
        <ItemDescriptionDiv>{children}</ItemDescriptionDiv>

        {type === 'anchor' && buttonLink && (
          <a href={buttonLink} rel="noopener noreferrer" target="_blank">
            <Button variant="primary">{buttonText}</Button>
          </a>
        )}

        {type === 'link' && buttonLink && (
          <Link to={buttonLink}>
            <Button variant="primary">{buttonText}</Button>
          </Link>
        )}

        {type === 'button' && onClick && (
          <Button variant="primary" onClick={onClick}>
            {buttonText}
          </Button>
        )}
      </article>
    </ChecklistLI>
  );
};

export const StyledSection = styled.section`
  text-align: center;
`;

export const ChecklistUL = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 1rem;
`;

const ChecklistLI = styled.li`
  margin-bottom: 2rem;
`;

const ItemDescriptionDiv = styled.div`
  font-size: 1.25rem;
  margin: 0.75rem auto 1rem;
  max-width: 800px;
`;

export default ChecklistSection;
