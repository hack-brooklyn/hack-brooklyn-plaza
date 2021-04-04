import React, { useState } from 'react';
import styled from 'styled-components/macro';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { TeamJoinRequestModal } from 'components/teamformation';
import {
  CardArticle,
  ObjectiveStatementText,
  StyledActionButton,
  TopicOrSkillBadge,
  TopicsAndSkillsArea
} from 'common/styles/teamformation/teamFormationCardStyles';
import {
  Breakpoints,
  CommonTeamFormationCardProps,
  TeamFormationTeam
} from 'types';

import profileImage from 'assets/icons/profile.svg';
import openSeatImage from 'assets/icons/team-formation/open-seat.svg';

interface TeamFormationTeamCardProps extends CommonTeamFormationCardProps {
  teamData: TeamFormationTeam;
}

interface MemberImagesAreaProps {
  teamSize: number;
}

const TeamCard = (props: TeamFormationTeamCardProps): JSX.Element => {
  const { teamData, showActionButton, className } = props;

  const [requestModalOpen, setRequestModalOpen] = useState(false);

  return (
    <CardArticle className={className}>
      <TopHalf>
        <NameAndTopicsAndSkillsContainer>
          <NameArea>
            <NameText>{teamData.name}</NameText>
          </NameArea>

          <TopicsAndSkillsArea>
            {teamData.interestedTopicsAndSkills.map(
              (interestedTopicOrSkill, index) => {
                return (
                  <TopicOrSkillBadge
                    to={`/teamformation/teams/search?query=tos%3A${interestedTopicOrSkill}`}
                    key={index}
                  >
                    {interestedTopicOrSkill}
                  </TopicOrSkillBadge>
                );
              }
            )}
          </TopicsAndSkillsArea>
        </NameAndTopicsAndSkillsContainer>

        <div>
          <MemberImagesArea teamSize={teamData.size}>
            {generateMemberImages(teamData)}
          </MemberImagesArea>

          {showActionButton !== undefined && !showActionButton && (
            <MemberCountTop>
              {teamData.members.length}/{teamData.size} Members
            </MemberCountTop>
          )}
        </div>
      </TopHalf>

      <BottomHalf>
        <ObjectiveStatementText showJoinButton={showActionButton}>
          {teamData.objectiveStatement}
        </ObjectiveStatementText>

        {(showActionButton === undefined || showActionButton) && (
          <ActionButtonContainer>
            <MemberCount>
              {teamData.members.length}/{teamData.size} Members
            </MemberCount>

            <StyledActionButton onClick={() => setRequestModalOpen(true)}>
              Request to Join
            </StyledActionButton>
          </ActionButtonContainer>
        )}
      </BottomHalf>

      <TeamJoinRequestModal
        teamData={teamData}
        show={requestModalOpen}
        setShow={setRequestModalOpen}
      />
    </CardArticle>
  );
};

const generateMemberImages = (teamData: TeamFormationTeam) => {
  const memberImageComponents = [];

  for (let i = 0; i < teamData.size; i++) {
    if (i < teamData.members.length) {
      // Go through members array and add them first
      const member = teamData.members[i];
      memberImageComponents.push(
        <OverlayTrigger
          overlay={
            <Tooltip id={`member-${member.id}-tooltip`}>
              {member.user.firstName} {member.user.lastName}
            </Tooltip>
          }
          key={i}
        >
          <StyledTeamMemberImage
            src={profileImage}
            alt={`Team Member: ${member.user.firstName} ${member.user.lastName}`}
          />
        </OverlayTrigger>
      );
    } else {
      // If and when there are no more members to add, add placeholder icons
      memberImageComponents.push(
        <StyledTeamMemberImage
          src={openSeatImage}
          alt="Open Team Seat"
          key={i}
        />
      );
    }
  }

  return memberImageComponents;
};

const TopHalf = styled.div`
  display: flex;
  flex-direction: column-reverse;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    flex-direction: row;
    max-height: 55%;
    overflow: hidden;
  }
`;

const BottomHalf = styled.div`
  @media screen and (min-width: ${Breakpoints.Medium}px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    max-height: 45%;
  }
`;

const NameArea = styled.div`
  @media screen and (min-width: ${Breakpoints.Medium}px) {
    max-width: 95%;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.7rem;
  }
`;

const NameAndTopicsAndSkillsContainer = styled.div`
  flex-basis: 80%;
`;

const MemberImagesArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr ${(props: MemberImagesAreaProps) =>
      props.teamSize > 2 ? ' 1fr' : ''};
  grid-gap: 0.75rem;
  margin: 0 auto 0.75rem;
  width: 55%;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
    margin: 0;
    flex-basis: 20%;
    align-self: flex-start;
  }
`;

const NameText = styled.div`
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    text-align: left;
    margin-bottom: 0;
  }
`;

const StyledTeamMemberImage = styled.img`
  display: block;
  margin: 0;
  width: 100%;
  height: auto;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin: 0;
  }
`;

const MemberCountTop = styled.div`
  display: block;
  font-weight: bold;
  text-align: center;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-top: 0.5rem;
    margin-bottom: 0;
  }
`;

const MemberCount = styled.div`
  display: block;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 0.5rem;
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  overflow: visible;
`;

export default TeamCard;
