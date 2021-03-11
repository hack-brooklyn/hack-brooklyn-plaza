import React from 'react';
import styled from 'styled-components/macro';

import { PRIORITY_APPLICATIONS_ACTIVE } from 'index';
import checkmark from 'assets/icons/checkmark.svg';

const ApplicationSuccess = (): JSX.Element => {
  return (
    <article>
      <ImageAndHeading>
        <CheckmarkSvg src={checkmark} alt="Green checkmark indicating successful application submission." />
        <StyledHeading>Application Submitted!</StyledHeading>
      </ImageAndHeading>

      <Text className="ApplicationSuccess-text">
        <StyledParagraph>
          Thank you for applying to Hack Brooklyn! We have received your application and look forward to reviewing it.
          {PRIORITY_APPLICATIONS_ACTIVE ? ' As a priority applicant, expect to hear back by ' : ' Application decisions will begin releasing on '}
          <strong>March 29, 2021</strong>. In the meantime, be sure to
          spread the word about Hack Brooklyn and encourage your friends to apply as well.
        </StyledParagraph>

        <StyledParagraph>See you soon!</StyledParagraph>

        <StyledParagraph><strong>- The Hack Brooklyn Team</strong></StyledParagraph>
      </Text>
    </article>
  );
};

const ImageAndHeading = styled.div`
  margin: 2rem auto;
  text-align: center;
`;

const CheckmarkSvg = styled.img`
  margin-bottom: 1rem;
  width: 25%;
`;

const StyledHeading = styled.h2`
  font-size: 2.25rem;
  font-weight: bold;
`;

const Text = styled.div`
  margin: 0 auto;
  max-width: 700px;
`;

const StyledParagraph = styled.p`
  font-size: 1.25rem;
`;

export default ApplicationSuccess;
