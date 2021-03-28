import React from 'react';
import { FastField } from 'formik';
import Form from 'react-bootstrap/Form';

import { RequiredFormLabel } from 'components';
import {
  CenteredButton,
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupFormGroup,
  SetupParagraph,
  SetupSection
} from 'commonStyles';
import { ParticipantSetupStepProps } from '../TeamFormationParticipantSetup';
import { FormikModularFieldProps } from 'types';

const ParticipantStepTwo = (props: ParticipantSetupStepProps): JSX.Element => {
  const { formik, setCurrentStep } = props;

  return (
    <SetupSection>
      <SetupContent>
        <SetupParagraph>
          Great! Just a few more details and you’ll be finished with your
          profile.
        </SetupParagraph>

        <ParticipantSpecializationField
          controlId="tfpsSpecialization"
          fieldName="specialization"
          formik={formik}
        />

        <ParticipantObjectiveStatementField
          controlId="tfpsObjectiveStatement"
          fieldName="objectiveStatement"
          formik={formik}
        />
      </SetupContent>

      <CenteredButtonWithMarginBottom
        type="submit"
        size="lg"
        disabled={formik.isSubmitting}
      >
        Create Profile
      </CenteredButtonWithMarginBottom>

      <CenteredButton
        variant="outline-secondary"
        onClick={() => setCurrentStep(1)}
        disabled={formik.isSubmitting}
      >
        Go Back
      </CenteredButton>
    </SetupSection>
  );
};

export const ParticipantSpecializationField = (
  props: FormikModularFieldProps
): JSX.Element => {
  const { controlId, fieldName, formik } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      <RequiredFormLabel>Specialization</RequiredFormLabel>
      <FastField
        as={Form.Control}
        name={fieldName}
        type="text"
        placeholder="Full-Stack Developer, Java Developer, UX/UI Designer, etc."
        disabled={formik.isSubmitting}
        required
      />
    </SetupFormGroup>
  );
};

export const ParticipantObjectiveStatementField = (
  props: FormikModularFieldProps
): JSX.Element => {
  const { controlId, fieldName, placeholder, formik } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      <RequiredFormLabel>Objective Statement</RequiredFormLabel>
      <FastField
        as="textarea"
        className="form-control"
        name={fieldName}
        rows="5"
        maxlength="200"
        placeholder={
          placeholder === undefined
            ? `In under 200 characters, describe what you're looking for in a team, as well as your skills, interests, ideas, or anything else you want teams to know about you.`
            : placeholder
        }
        disabled={formik.isSubmitting}
        required
      />
    </SetupFormGroup>
  );
};

export default ParticipantStepTwo;
