import React from 'react';
import styled from 'styled-components/macro';

import { Date } from 'components';

import PriorityAppDate from 'assets/apply/priority-apps.svg';
import GeneralAppDate from 'assets/apply/general-apps.svg';
import ApplicationDeadlineDate from 'assets/apply/application-deadline.svg';
import AcceptanceReleaseDate from 'assets/apply/acceptances-release.svg';

const ImportantDates = (): JSX.Element => {
  return (
    <StyledSection>
      <StyledHeading>Important Dates</StyledHeading>
      <DateGrid>
        <Date src={PriorityAppDate} alt="February 19, 2021">
          Priority Applications Open
        </Date>
        <Date src={GeneralAppDate} alt="March 5, 2021">
          General Applications Open
        </Date>
        <Date src={AcceptanceReleaseDate} alt="March 29, 2021">
          Decisions Begin Releasing
        </Date>
        <Date src={ApplicationDeadlineDate} alt="April 16, 2021">
          Last Day to Apply
        </Date>
      </DateGrid>
    </StyledSection>
  );
};

const StyledSection = styled.section`
  margin-top: 2rem;
`;

const StyledHeading = styled.h2`
  margin: 2rem auto;
  font-weight: bold;
  text-align: center;
`;

const DateGrid = styled.div`
  @media screen and (min-width: 576px) {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    grid-row-gap: 2rem;
  }
`;

export default ImportantDates;
