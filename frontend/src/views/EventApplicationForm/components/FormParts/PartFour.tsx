import React from 'react';
import { StyledFieldset, StyledTitleLegend } from 'views/EventApplicationForm/styles';
import { FastField } from 'formik';
import { StyledFormLabel } from 'commonStyles';
import styled from 'styled-components/macro';

const PartFour = (): JSX.Element => {
  return (
    <StyledFieldset>
      <StyledTitleLegend>Part 4: Short Response</StyledTitleLegend>
      <ShortResponseQuestion
        name="shortResponseOne"
        question="What do you hope to gain by coming to Hack Brooklyn?"
      />
      <ShortResponseQuestion
        name="shortResponseTwo"
        question="If you could build anything to change the world for the better, what would you make?"
      />
      <ShortResponseQuestion
        name="shortResponseThree"
        question="Is there anything else you want to let us know about?"
      />
    </StyledFieldset>
  );
};

interface ShortResponseQuestionProps {
  name: string;
  question: string;
}

const ShortResponseQuestion = (props: ShortResponseQuestionProps) => {
  const { name, question } = props;
  const id = 'application' + name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <QuestionContainer>
      <StyledFormLabel htmlFor={id}>{question}</StyledFormLabel>
      <FastField as="textarea"
                 className="form-control"
                 name={name}
                 id={id}
                 rows="3"
      />
    </QuestionContainer>
  );
};

const QuestionContainer = styled.div`
  margin-bottom: 1rem;
`;

export default PartFour;
