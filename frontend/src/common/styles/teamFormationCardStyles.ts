import styled from 'styled-components/macro';
import Button from 'react-bootstrap/Button';

import { LinkBadge } from 'components';
import { Breakpoints } from 'types';

export const CardArticle = styled.article`
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

export const TopicsAndSkillsArea = styled.div`
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 1rem;
  }
`;

export const TopicOrSkillBadge = styled(LinkBadge)`
  padding: 0.35rem 0.65rem;
  margin-right: 0.4rem;
  margin-bottom: 0.4rem;
  background-color: #8540f5;
  transition: 0.175s;
  transition-timing-function: ease-in-out;

  &:hover {
    background-color: #9459fc;
  }
`;

export const ObjectiveStatementText = styled.p`
  flex-basis: 70%;
  align-self: flex-end;
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

export const ActionButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
  overflow: visible;
`;

export const StyledActionButton = styled(Button)`
  width: 100%;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
  }
`;
