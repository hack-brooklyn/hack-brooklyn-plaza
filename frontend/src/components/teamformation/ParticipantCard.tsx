import React from 'react';
import styled from 'styled-components/macro';

import {
  ActionButtonContainer,
  CardArticle,
  ObjectiveStatementText,
  StyledActionButton,
  TopicOrSkillBadge,
  TopicsAndSkillsArea
} from 'common/styles/teamformation/teamFormationCardStyles';
import { Breakpoints, TeamFormationParticipant } from 'types';

import profileImage from 'assets/icons/profile.svg';

interface TeamFormationParticipantCardProps {
  participantData: TeamFormationParticipant;
}

const ParticipantCard = (
  props: TeamFormationParticipantCardProps
): JSX.Element => {
  const { participantData } = props;

  return (
    <CardArticle>
      <TopHalf>
        <ProfileArea>
          <StyledProfileImage
            src={profileImage}
            alt={
              participantData.user.firstName +
              ' ' +
              participantData.user.lastName
            }
          />
          <NameAndTitleContainer>
            <NameText>
              {participantData.user.firstName} {participantData.user.lastName}
            </NameText>
            <SpecializationText>
              {participantData.specialization}
            </SpecializationText>
          </NameAndTitleContainer>
        </ProfileArea>

        <TopicsAndSkillsArea>
          {participantData.interestedTopicsAndSkills.map(
            (interestedTopicOrSkill, index) => {
              return (
                <TopicOrSkillBadge
                  to={`/teamformation/participants/search?query=tos%3A${interestedTopicOrSkill}`}
                  key={index}
                >
                  {interestedTopicOrSkill}
                </TopicOrSkillBadge>
              );
            }
          )}
        </TopicsAndSkillsArea>
      </TopHalf>

      <BottomHalf>
        <ObjectiveStatementText>
          {participantData.objectiveStatement}
        </ObjectiveStatementText>

        <ActionButtonContainer>
          {/* TODO: Add logic to handle invitations */}
          <StyledActionButton>Invite to Team</StyledActionButton>
        </ActionButtonContainer>
      </BottomHalf>
    </CardArticle>
  );
};

const TopHalf = styled.div`
  max-height: 55%;
  overflow: hidden;
`;

const BottomHalf = styled.div`
  @media screen and (min-width: ${Breakpoints.Medium}px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    max-height: 45%;
  }
`;

const ProfileArea = styled.div`
  @media screen and (min-width: ${Breakpoints.Medium}px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.7rem;
  }
`;

const NameAndTitleContainer = styled.div`
  text-align: center;
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    text-align: left;
    margin-bottom: 0;
    margin-left: 1rem;
  }
`;

const StyledProfileImage = styled.img`
  display: block;
  margin: 0 auto 0.75rem;
  width: 8rem;
  height: 8rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin: 0;
    width: 3.75rem;
    height: 3.75rem;
  }
`;

const NameText = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
`;

const SpecializationText = styled.div`
  font-size: 1.25rem;
`;

export default ParticipantCard;
