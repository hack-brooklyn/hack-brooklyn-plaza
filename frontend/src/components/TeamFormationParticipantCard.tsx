import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';

import { BadgeBS5 as Badge } from 'components';
import { Breakpoints, RootState, TeamFormationParticipant } from 'types';

import profileImage from 'assets/icons/profile.svg';

interface TeamFormationParticipantCardProps {
  data: TeamFormationParticipant;
}

const TeamFormationParticipantCard = (
  props: TeamFormationParticipantCardProps
): JSX.Element => {
  const { data } = props;

  const firstName = useSelector((state: RootState) => state.user.firstName);
  const lastName = useSelector((state: RootState) => state.user.lastName);

  return (
    <StyledArticle>
      <TopHalf>
        <ProfileArea>
          <StyledProfileImage
            src={profileImage}
            alt={firstName + ' ' + lastName}
          />
          <NameAndTitleContainer>
            <NameText>
              {firstName} {lastName}
            </NameText>
            <SpecializationText>{data.specialization}</SpecializationText>
          </NameAndTitleContainer>
        </ProfileArea>

        <TopicsAndSkillsArea>
          {data.interestedTopicsAndSkills.map(
            (interestedTopicOrSkill, index) => {
              return (
                <StyledBadge key={index}>{interestedTopicOrSkill}</StyledBadge>
              );
            }
          )}
        </TopicsAndSkillsArea>
      </TopHalf>

      <BottomHalf>
        <ObjectiveStatementText>
          {data.objectiveStatement}
        </ObjectiveStatementText>

        <ButtonContainer>
          {/* TODO: Add logic to handle invitations */}
          <StyledButton>Invite to Team</StyledButton>
        </ButtonContainer>
      </BottomHalf>
    </StyledArticle>
  );
};

const StyledArticle = styled.article`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
  padding: 1.5rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  overflow: hidden;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    padding: 1.75rem;
    max-width: 34.375rem;
    max-height: 21.875rem;
    width: 100vw;
    height: 100vh;
  }
`;

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

const NameAndTitleContainer = styled.div`
  text-align: center;
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    text-align: left;
    margin-bottom: 0;
    margin-left: 1rem;
  }
`;

const NameText = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
`;

const SpecializationText = styled.div`
  font-size: 1.25rem;
`;

const TopicsAndSkillsArea = styled.div`
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 1rem;
  }
`;

const StyledBadge = styled(Badge)`
  padding: 0.35rem 0.65rem;
  margin-right: 0.4rem;
  margin-bottom: 0.4rem;
  background-color: #8540f5;
`;

const ObjectiveStatementText = styled.p`
  flex-basis: 70%;
  font-size: 1rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-top: 0.875rem;
    margin-bottom: 0;

    // Ellipsis after 5 lines
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
  overflow: visible;
`;

const StyledButton = styled(Button)`
  width: 100%;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
  }
`;

export default TeamFormationParticipantCard;
