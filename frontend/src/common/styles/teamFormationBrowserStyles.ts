import styled from 'styled-components/macro';
import Form from 'react-bootstrap/Form';

import { TeamFormationTeamCard } from 'components';
import { Breakpoints } from 'types';

export const TitleArea = styled.div`
  align-self: flex-start;
`;

export const VisibilityStatus = styled.div`
  margin-left: 0.25rem;
  display: flex;
`;

export const VisibilityStatusText = styled.div`
  margin-left: 0.5rem;
`;

export const PersonalizedResultsSection = styled.section`
  margin-top: 4rem;
`;

export const SearchForm = styled(Form)`
  max-width: 31.25rem;
  margin: 1rem auto 2rem;
`;

export const StyledTeamCard = styled(TeamFormationTeamCard)`
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.ExtraLarge}px) {
    margin: 0;
  }
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
