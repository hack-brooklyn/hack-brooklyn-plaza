import styled from 'styled-components/macro';

import { LinkButton } from 'components';
import { Breakpoints } from 'types';

export const TopSection = styled.section`
  margin: 2rem auto;
`;

export const SetupOption = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const SetupOptionIcon = styled.img`
  height: 4rem;
  width: 4rem;
`;

export const SetupOptionDescription = styled.div`
  margin-left: 1rem;
  max-width: 350px;
  font-size: 1.3rem;
  font-weight: bold;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    text-align: center;
  }
`;

export const TFLinkButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const TFHomeButton = styled(LinkButton)`
  && {
    color: #6c757d;
    background-color: #fff;
    border-color: #6c757d;
  }

  &:hover {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
  }
`;
