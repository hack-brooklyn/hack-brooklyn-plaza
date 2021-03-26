import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import { Breakpoints } from 'types';

interface ButtonContentProps {
  icon: string;
  text: string;
}

interface HeadingButtonProps extends ButtonContentProps {
  type: 'button' | 'link' | 'anchor';
  link?: string;
  onClick?: () => void;
}

const HeadingButton = (props: HeadingButtonProps): JSX.Element | null => {
  const { type, link, onClick, icon, text } = props;

  if (type === 'link' && link !== undefined) {
    return (
      <StyledLink to={link}>
        <ButtonContent icon={icon} text={text} />
      </StyledLink>
    );
  } else if (type === 'anchor' && link !== undefined) {
    return (
      <StyledAnchor href={link}>
        <ButtonContent icon={icon} text={text} />
      </StyledAnchor>
    );
  } else if (type === 'button' && onClick !== undefined) {
    return (
      <button onClick={onClick}>
        <ButtonContent icon={icon} text={text} />
      </button>
    );
  } else {
    return null;
  }
};

const ButtonContent = (props: ButtonContentProps) => {
  const { icon, text } = props;
  return (
    <ButtonContainer>
      <IconArea>
        <ButtonIcon src={icon} alt={text} />
      </IconArea>

      <ButtonText>
        {text}
      </ButtonText>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    flex-direction: column;
  }
`;

const IconArea = styled.div`
  color: white;
  background-color: #0d6efd;
  border-radius: 100%;
  width: 3.5rem;
  height: 3.5rem;

  display: flex;
  justify-content: center;
  align-items: center;

  margin-bottom: 0;

  transition: 0.175s;
  transition-timing-function: ease-in-out;

  img {
    fill: white;
    width: 1.75rem;
    height: 1.75rem;
  }

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 0.5rem;
  }
`;

const LinkStyles = css`
  padding: 0.5rem 0;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
  text-decoration: none;
  color: black;
  font-size: 1rem;
  font-weight: bold;

  transition: 0.175s;
  transition-timing-function: ease-in-out;

  &:hover {
    color: black;

    ${IconArea} {
      background-color: #0a53be;
    }
  }

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-left: 1rem;
    padding: 0;
    max-width: 6rem;
    font-size: 0.875rem;
  }
`;

const StyledLink = styled(Link)`
  ${LinkStyles}
`;

const StyledAnchor = styled.a`
  ${LinkStyles}
`;

const ButtonIcon = styled.img`

`;

const ButtonText = styled.p`
  margin: 0 0 0 0.75rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin: 0;
  }
`;

export default HeadingButton;
