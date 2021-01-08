import styled from 'styled-components/macro';

export const StyledFieldset = styled.fieldset`
  margin: 1.5rem auto 0;
`;

export const StyledLegend = styled.legend`
  margin: 0 auto 1rem;
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
`;

export const FormFields = styled.div`
  @media screen and (min-width: 992px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 2rem;
  }
`;