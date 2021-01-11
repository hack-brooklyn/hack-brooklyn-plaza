import styled from 'styled-components/macro';

export const StyledFieldset = styled.fieldset`
  margin: 1.5rem auto 0;
`;

export const StyledTitleLegend = styled.legend`
  margin: 0.75rem auto 0.25rem;
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
`;

export const ApplicationFormFields = styled.div`
  @media screen and (min-width: 992px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 2rem;
  }
`;