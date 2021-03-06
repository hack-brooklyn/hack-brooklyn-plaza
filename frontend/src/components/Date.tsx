import React from 'react';
import styled from 'styled-components/macro';

interface DateProps {
  src: string;
  alt?: string;
  children?: React.ReactNode;
}

const Date = (props: DateProps): JSX.Element => {
  const { src, alt, children } = props;

  return (
    <DateContainer>
      <CalendarDate src={src} alt={alt} />
      <Description>{children}</Description>
    </DateContainer>
  );
};

const DateContainer = styled.div`
  margin-bottom: 2rem;

  @media screen and (min-width: 576px) {
    margin: 0 auto;
  }
`;

const CalendarDate = styled.img`
  display: block;
  margin: 0 auto;
`;

const Description = styled.p`
  margin-top: 0.5rem;
  font-weight: bold;
  font-size: 1.5rem;
  text-align: center;
`;

export default Date;
