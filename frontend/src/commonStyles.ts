import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import Form from 'react-bootstrap/Form';
import NavLink from 'react-bootstrap/NavLink';

import { Breakpoints } from 'types';

export const StyledH1 = styled.h1`
  font-size: 2.5rem;
  text-align: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 3rem;
    text-align: left;
  }
`;

export const StyledCenteredH1 = styled(StyledH1)`
  text-align: center;
`;

export const StyledCenteredMarginH1 = styled(StyledCenteredH1)`
  text-align: center;
  margin-bottom: 2rem;
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

export const StyledNavLink = styled(NavLink)`
  padding: 0;
  margin-right: 1rem;
`;

export const Logo = styled(Link)`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;
  font-weight: bold;

  .logo-img {
    height: 3rem;
  }

  .logo-text {
    font-size: 1.5rem;
    margin-left: 0.5rem;
    font-family: 'Major Mono Display', monospace;
  }
`;

export const StyledAuthForm = styled(Form)`
  margin: 0 auto;
  max-width: 400px;
`;
