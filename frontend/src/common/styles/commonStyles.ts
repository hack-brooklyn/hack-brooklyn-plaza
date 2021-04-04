import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import NavLink from 'react-bootstrap/NavLink';

import { Breakpoints } from 'types';

export const StyledH1 = styled.h1`
  font-size: 2.5rem;
  text-align: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 3rem;
    text-align: left;
    align-self: flex-start;
  }
`;

export const StyledCenteredH1 = styled(StyledH1)`
  text-align: center;
`;

export const StyledCenteredMarginH1 = styled(StyledCenteredH1)`
  margin-bottom: 2rem;
`;

export const StyledH2 = styled.h2`
  font-size: 2rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 2.25rem;
  }
`;

export const StyledCenteredH2 = styled(StyledH2)`
  text-align: center;
`;

export const StyledCenteredMarginH2 = styled(StyledCenteredH2)`
  margin-bottom: 2rem;
`;

export const StyledH3 = styled.h3`
  font-size: 1.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    font-size: 1.75rem;
  }
`;

export const StyledCenteredH3 = styled(StyledH3)`
  text-align: center;
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

export const HeadingSection = styled.section`
  margin-bottom: 2rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

export const CenteredButton = styled(Button)`
  display: block;
  margin: 0 auto;
`;

export const CenteredButtonWithMarginBottom = styled(CenteredButton)`
  margin-bottom: 1rem;
`;

export const StyledSubmitButton = styled(Button)`
  display: block;
  margin: 2rem auto;
`;

export const ButtonActiveOverrideStyles = css`
  &.btn-primary.active {
    background-color: #0d6efd;
    border-color: #0d6efd;

    &:hover,
    &:focus {
      background-color: #0b5ed7;
      border-color: #0a58ca;
    }

    &:active {
      background-color: #0a58ca;
      border-color: #0a53be;
    }
  }

  &.btn-outline-primary.active {
    color: #0d6efd;
    background-color: transparent;

    &:hover,
    &:focus,
    &:active {
      color: #fff;
      background-color: #0d6efd;
    }
  }

  &.btn-success.active {
    background-color: #198754;
    border-color: #198754;

    &:hover,
    &:focus {
      background-color: #157347;
      border-color: #146c43;
    }

    &:active {
      background-color: #146c43;
      border-color: #13653f;
    }
  }
`;

export const SetupParagraph = styled.p`
  margin: 0 auto 1rem;
  max-width: 600px;
  font-size: 1.1rem;
  text-align: center;
`;

export const SetupSection = styled.section`
  margin: 0 auto;
  max-width: 800px;
`;

export const SetupFormGroup = styled(Form.Group)`
  margin: 0 auto;
  max-width: 600px;
`;

export const SetupContent = styled.div`
  margin-bottom: 1rem;
`;
