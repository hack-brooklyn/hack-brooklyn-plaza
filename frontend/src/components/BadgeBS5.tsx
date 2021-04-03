import React from 'react';
import Badge from 'react-bootstrap/Badge';

export interface BadgeBS5Props {
  children?: React.ReactNode;
}

const BadgeBS5 = (props: BadgeBS5Props): JSX.Element => {
  const { children } = props;

  return (
    <Badge bsPrefix="badge rounded-pill" {...props}>
      {children}
    </Badge>
  );
};

export default BadgeBS5;
