import React from 'react';
import { Link } from 'react-router-dom';

import { BadgeBS5 as Badge } from 'components';
import { BadgeBS5Props } from 'components/BadgeBS5';

interface LinkBadgeProps extends BadgeBS5Props {
  to: string;
}

const LinkBadge = (props: LinkBadgeProps): JSX.Element => {
  const { to, children } = props;

  return (
    <Link to={to}>
      <Badge {...props}>{children}</Badge>
    </Link>
  );
};

export default LinkBadge;
