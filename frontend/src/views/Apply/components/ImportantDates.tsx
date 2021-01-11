import React from 'react';
import styled from 'styled-components/macro';
import Date from 'components/Date';
import PriorityAppDate from 'assets/apply/priority-apps.svg';
import GeneralAppDate from 'assets/apply/general-apps.svg';
import ApplicationDeadlineDate from 'assets/apply/application-deadline.svg';
import AcceptanceReleaseDate from 'assets/apply/acceptances-release.svg';

const ImportantDates = (): JSX.Element => {
  return (
    <StyledSection>
      <StyledHeading>Important Dates</StyledHeading>
      <DateGrid>
        <Date src={PriorityAppDate} alt="January 4, 2021">
          Priority Applications Open
        </Date>
        <Date src={GeneralAppDate} alt="January 11, 2021">
          General Applications Open
        </Date>
        <Date src={ApplicationDeadlineDate} alt="February 22, 2021">
          Last Day to Apply
        </Date>
        <Date src={AcceptanceReleaseDate} alt="March 1, 2021">
          Acceptances Begin Releasing
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
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 1fr;
  grid-row-gap: 2rem;
`;

export default ImportantDates;
