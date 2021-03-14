import React from 'react';
import Button from 'react-bootstrap/Button';
import { LinkContainer } from 'react-router-bootstrap';
import { ButtonVariant } from 'react-bootstrap/types';

interface LinkButtonProps {
  to: string;
  size?: 'sm' | 'lg' | undefined;
  variant?: ButtonVariant;
  children?: React.ReactNode;
}

const LinkButton = (props: LinkButtonProps): JSX.Element => {
  const { to, size, variant, children } = props;

  return (
    <span>
      <LinkContainer to={to}>
        <Button variant={variant} size={size}>{children}</Button>
      </LinkContainer>
    </span>
  );
};

export default LinkButton;
