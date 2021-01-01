import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/Button';

interface LinkButtonProps {
  to: string;
  size?: 'sm' | 'lg' | undefined;
  children?: React.ReactNode;
}

const LinkButton = (props: LinkButtonProps) => {
  const { to, children, size } = props;

  return (
    <span>
      <LinkContainer to={to}>
        <Button size={size ? size : undefined}>{children}</Button>
      </LinkContainer>
    </span>
  );
};

export default LinkButton;