import React from 'react';

import {
  ParticipantObjectiveStatementField,
  ParticipantSpecializationField
} from 'components/teamformation/TeamFormationFormFields';
import {
  CenteredButton,
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupParagraph,
  SetupSection
} from 'common/styles/commonStyles';
import { ParticipantSetupStepProps } from 'views/teamformation/TeamFormationParticipantSetup/TeamFormationParticipantSetup';

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

export default ParticipantStepTwo;
