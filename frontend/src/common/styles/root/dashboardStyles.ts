import styled from 'styled-components/macro';

import { StyledH2 } from 'common/styles/commonStyles';
import { Breakpoints } from 'types';

export const LiveDashboardSection = styled.section`
  margin-bottom: 2rem;
  
  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 1rem;
  }
`;

export const LiveDashboardHeading = styled(StyledH2)`
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 2.5rem;
    text-align: left;
  }
`;
