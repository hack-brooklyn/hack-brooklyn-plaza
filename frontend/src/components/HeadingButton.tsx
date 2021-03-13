import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';

interface ButtonContentProps {
  icon: string;
  text: string;
}

interface HeadingButtonProps extends ButtonContentProps {
  type: 'button' | 'link';
  linkTo?: string;
  buttonOnClick?: () => void;
}

const HeadingButton = (props: HeadingButtonProps): JSX.Element | null => {
  const { type, linkTo, buttonOnClick, icon, text } = props;

  if (type === 'link' && linkTo !== undefined) {
    return (
      <StyledLink to={linkTo}>
        <ButtonContent icon={icon} text={text} />
      </StyledLink>
    );
  } else if (type === 'button' && buttonOnClick !== undefined) {
    return (
      <button onClick={buttonOnClick}>
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
    <>
      <IconArea>
        <ButtonIcon src={icon} alt={text} />
      </IconArea>

      <ButtonText>
        {text}
      </ButtonText>
    </>
  );
};

const IconArea = styled.div`
  color: white;
  background-color: #0d6efd;
  border-radius: 100%;
  width: 3.5rem;
  height: 3.5rem;

  display: flex;
  justify-content: center;
  align-items: center;

  margin-bottom: 0.5rem;

  transition: 0.175s;
  transition-timing-function: ease-in-out;

  img {
    fill: white;
    width: 1.75rem;
    height: 1.75rem;
  }
`;

const StyledLink = styled(Link)`
  margin-left: 1rem;
  max-width: 6rem;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
  text-decoration: none;
  color: black;
  font-size: 0.875rem;
  font-weight: bold;

  transition: 0.175s;
  transition-timing-function: ease-in-out;

  &:hover {
    color: black;

    ${IconArea} {
      background-color: #0a53be;
    }
  }
`;

const ButtonIcon = styled.img`

`;

const ButtonText = styled.p`
  margin: 0;
`;

export default HeadingButton;
