import styled, { css } from 'styled-components/macro';
import Form from 'react-bootstrap/Form';

import { ParticipantCard, TeamCard } from 'components/teamformation';
import { Breakpoints } from 'types';

export const TitleArea = styled.div`
  align-self: flex-start;
`;

export const VisibilityStatus = styled.div`
  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-left: 0.25rem;
    display: flex;
  }
`;

export const VisibilityStatusText = styled.div`
  text-align: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    text-align: left;
    margin-left: 0.5rem;
  }
`;

export const PersonalizedResultsSection = styled.section``;

export const SearchForm = styled(Form)`
  max-width: 31.25rem;
  margin: 1rem auto 2rem;
`;

export const StyledTeamFormationCard = css`
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    margin: 0;
  }
`;

export const StyledTeamCard = styled(TeamCard)`
  ${StyledTeamFormationCard};
`;

export const StyledParticipantCard = styled(ParticipantCard)`
  ${StyledTeamFormationCard};
`;

export const ResultsGrid = styled.div`
  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    display: grid;
    grid-template-columns: 34.375rem 34.375rem;
    grid-gap: 1rem;
    justify-content: center;
    align-items: center;
  }

  @media screen and (min-width: ${Breakpoints.ExtraExtraLarge}px) {
    grid-gap: 2rem;
  }
`;

export const MessageText = styled.div`
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
`;

export const LinkButtonContainer = styled.div`
  margin: 2rem auto 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const LoadingSection = styled.section`
  margin: 0 auto 3rem;
  text-align: center;
`;

export const LoadingSpinner = styled.img`
  margin-top: 2rem;
  width: 4rem;
  height: 4rem;
`;

export const SearchSection = styled.section``;

export const LoadingIndicator = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: gray;
`;

export const SearchLoadingSpinner = styled.img`
  margin-top: 0.5rem;
  width: 2rem;
  height: 2rem;
`;
