import React from 'react';
import styled from 'styled-components/macro';

import { SubmittedApplication } from 'types';

interface ShortResponseSectionProps {
  applicationData: SubmittedApplication;
}

interface ShortResponseQuestionProps {
  question: string;
  response: string | null;
}

const ShortResponseSection = (props: ShortResponseSectionProps): JSX.Element => {
  const { applicationData } = props;

  return (
    <StyledSection>
      <ShortResponse
        question="What do you hope to gain by coming to Hack Brooklyn?"
        response={applicationData.shortResponseOne}
      />
      <ShortResponse
        question="If you could build anything to change the world for the better, what would you make?"
        response={applicationData.shortResponseTwo}
      />
      <ShortResponse
        question="Is there anything else you want to let us know about?"
        response={applicationData.shortResponseThree}
      />
    </StyledSection>
  );
};

const ShortResponse = (props: ShortResponseQuestionProps): JSX.Element => {
  const { question, response } = props;

  return (
    <ShortResponseContent>
      <ShortResponseQuestion>{question}</ShortResponseQuestion>
      {response && response.trim() !== '' ? (
        <ShortResponseResponse>{response}</ShortResponseResponse>
      ) : (
        <ShortResponseResponseBlank>
          No response provided.
        </ShortResponseResponseBlank>
      )}
    </ShortResponseContent>
  );
};

// Short Response Section
const StyledSection = styled.section`
  margin: 0 auto 3rem;
  max-width: 900px;
`;

const ShortResponseContent = styled.div`
  margin-bottom: 2rem;
`;

const ShortResponseQuestion = styled.h3`
  font-weight: bold;
`;

const ShortResponseResponse = styled.p`
  font-size: 1.25rem;
`;

const ShortResponseResponseBlank = styled(ShortResponseResponse)`
  color: #abb5be;
`;

export default ShortResponseSection;
