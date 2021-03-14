import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';

import arrowIcon from 'assets/icons/arrow.svg';

interface ActionLinkProps {
  name: string;
  description: string;
  link: string;
}

const ActionLink = (props: ActionLinkProps) => {
  const { name, description, link } = props;

  return (
    <LinkToAction to={link}>
      <Heading>{name}</Heading>
      <ArrowIcon src={arrowIcon} />
      <Description>{description}</Description>
    </LinkToAction>
  );
};

const LinkToAction = styled(Link)`
  text-align: center;
  margin: 0 auto;
  text-decoration: none;
  color: black;
  transition: 0.175s;
  transition-timing-function: ease-in-out;
`;

const Heading = styled.h2`
  margin: 0 auto;
  font-size: 2.25rem;
`;

const ArrowIcon = styled.img`
  display: block;
  margin: 0 auto;
  padding: 1.5rem 0;
`;

const Description = styled.p`
  margin: 0 auto;
  font-size: 1.1rem;
  max-width: 16rem;
`;

export default ActionLink;
