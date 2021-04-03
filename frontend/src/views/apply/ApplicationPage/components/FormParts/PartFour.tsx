import React from 'react';
import { FastField } from 'formik';
import styled from 'styled-components/macro';

import { StyledFieldset, StyledTitleLegend } from 'common/styles/apply/applicationPageStyles';
import { StyledFormLabel } from 'common/styles/commonStyles';
import { FormPartProps } from '../ApplicationForm';

const PartFour = (props: FormPartProps): JSX.Element => {
  const { formik } = props;

  return (
    <StyledFieldset>
      <StyledTitleLegend>Part 4: Short Response (Optional)</StyledTitleLegend>
      <ShortResponseQuestion
        name="shortResponseOne"
        question="What do you hope to gain by coming to Hack Brooklyn?"
        formik={formik}
      />
      <ShortResponseQuestion
        name="shortResponseTwo"
        question="If you could build anything to change the world for the better, what would you make?"
        formik={formik}
      />
      <ShortResponseQuestion
        name="shortResponseThree"
        question="Is there anything else you want to let us know about?"
        formik={formik}
      />
    </StyledFieldset>
  );
};

interface ShortResponseQuestionProps extends FormPartProps {
  name: string;
  question: string;
}

const ShortResponseQuestion = (props: ShortResponseQuestionProps) => {
  const { formik, name, question } = props;
  const id = 'application' + name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <QuestionContainer>
      <StyledFormLabel htmlFor={id}>{question}</StyledFormLabel>
      <FastField as="textarea"
                 className="form-control"
                 name={name}
                 id={id}
                 rows="3"
                 disabled={formik.isSubmitting}
      />
    </QuestionContainer>
  );
};

const QuestionContainer = styled.div`
  margin-bottom: 1rem;
`;

export default PartFour;
