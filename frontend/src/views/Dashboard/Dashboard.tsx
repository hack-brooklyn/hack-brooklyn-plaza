import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import Countdown, { CountdownRenderProps } from 'react-countdown';
import Button from 'react-bootstrap/Button';

import { HeadingActions } from 'components';
import { StyledH1, StyledH2, StyledH3 } from 'commonStyles';
import { Breakpoints, MenuAction, Roles, RootState } from 'types';
import listIcon from 'assets/icons/list.svg';
import announcementIcon from 'assets/icons/announcement.svg';
import calendarPlusIcon from 'assets/icons/calendar-plus.svg';

interface ChecklistItemProps {
  type: 'anchor' | 'link' | 'button';
  name: string;
  buttonText: string;
  buttonLink?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

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

      <CountdownSection>
        <StyledH2>Hacking Begins In</StyledH2>
        <Countdown date={new Date('April 23, 2021 6:00 PM')} renderer={countdownRenderer} />
      </CountdownSection>

      <ChecklistSection>
        <StyledH2>Pre-Hackathon Checklist</StyledH2>

        <ChecklistUL>
          <ChecklistItem type="anchor"
                         name="1. Join the Hack Brooklyn Discord server"
                         buttonText="Join Discord Server"
                         buttonLink="http://www.hackbrooklyn.org/discord">
            Most of the hackathon’s action will take place on the Hack Brooklyn Discord server. Make sure to join the
            Discord server so you don’t miss any exciting news and events.
          </ChecklistItem>

          <ChecklistItem type="link"
                         name="2. Find a team to work with"
                         buttonText="Enter Team Formation"
                         buttonLink="/teamformation">
            No team? No problem! Head over to <strong>Team Formation</strong> now to browse teams looking for new
            members, find like-minded participants to work with, and assemble your dream team.
          </ChecklistItem>

          {/*<ChecklistItem type="link"*/}
          {/*               name="3. Build your custom event schedule"*/}
          {/*               buttonText="Build Your Schedule"*/}
          {/*               buttonLink="/schedule">*/}
          {/*  Browse the agenda to discover exciting workshops and events happening throughout the hackathon, and build*/}
          {/*  your own personalized schedule to get notifications when they happen!*/}
          {/*</ChecklistItem>*/}

          <ChecklistItem type="anchor"
                         name="3. Register for the hackathon on Devpost"
                         buttonText="Register on Devpost"
                         buttonLink="https://hackbrooklyn.devpost.com">
            Projects will be submitted for judging on Devpost. Register for the hackathon on Devpost with your team to
            be eligible to compete for a prize!
          </ChecklistItem>

          <ChecklistItem type="anchor"
                         name="4. Claim your Hopin ticket"
                         buttonText="Claim Hopin Ticket"
                         buttonLink="https://hopin.com">
            Some of the hackathon’s activities will take place on Hopin, including speed networking, sponsor booth
            visits, and select workshops. Claim your free ticket now to gain full access!
          </ChecklistItem>
        </ChecklistUL>
      </ChecklistSection>
    </>
  );
};

const ChecklistItem = (props: ChecklistItemProps) => {
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
          <Button variant="primary" onClick={onClick}>{buttonText}</Button>
        )}
      </article>
    </ChecklistLI>
  );
};

const countdownRenderer = (props: CountdownRenderProps) => {
  const { days, hours, minutes, seconds, completed } = props;

  if (completed) {
    return <p>done</p>;
  } else {
    return (
      <div role="text">
        <DaysRemainingText>{days} days</DaysRemainingText>
        <HMSRemainingText>{hours} hours, {minutes} minutes, and {seconds} seconds</HMSRemainingText>
      </div>
    );
  }
};

const HeadingSection = styled.section`
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    display: flex;
    justify-content: space-between;
  }
`;

// Countdown
const CountdownSection = styled.section`
  text-align: center;
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-top: 4rem;
    margin-bottom: 4rem;
  }
`;

const DaysRemainingText = styled.p`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: -0.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 4rem;
    margin-bottom: -0.75rem;
  }
`;

const HMSRemainingText = styled.p`
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 3rem;
  }
`;

// Pre-Hackathon Checklist
const ChecklistSection = styled.section`
  text-align: center;
`;

const ChecklistUL = styled.ul`
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

export default Dashboard;
