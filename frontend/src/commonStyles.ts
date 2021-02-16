import styled, { css } from 'styled-components/macro';
import Form from 'react-bootstrap/Form';

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
