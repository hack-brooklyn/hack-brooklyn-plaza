import styled, { css } from 'styled-components/macro';
import Form from 'react-bootstrap/Form';
import { Breakpoints } from 'types';

export const H1Styled = styled.h1`
  font-size: 2.5rem;
  text-align: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 3rem;
    text-align: left;
  }
`;

export const StyledH2 = styled.h2`
  font-size: 2rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 2.25rem;
  }
`;

export const StyledH3 = styled.h3`
  font-size: 1.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 1.75rem;
  }
`;

export const MonoHeading = styled.h1`
  font-family: 'Anonymous Pro', monospace;
  font-weight: bold;
  text-align: center;
`;

export const FormLabelStyles = css`
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1rem; // Bootstrap 5 fix
`;

export const StyledFormLabel = styled(Form.Label)`
  ${FormLabelStyles}
`;

export const StyledFormLabelLegend = styled.legend`
  ${FormLabelStyles}
`;
