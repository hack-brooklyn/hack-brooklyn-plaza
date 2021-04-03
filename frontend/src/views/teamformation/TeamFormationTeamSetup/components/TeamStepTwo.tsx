import React, { useState } from 'react';
import { toast } from 'react-toastify';

import {
  ParticipantObjectiveStatementField,
  ParticipantSpecializationField
} from 'views/teamformation/TeamFormationParticipantSetup/components/ParticipantStepTwo';
import {
  CenteredButton,
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupParagraph,
  SetupSection
} from 'common/styles/commonStyles';
import { TeamSetupStepProps } from '../TeamFormationTeamSetup';

const TeamStepTwo = (props: TeamSetupStepProps): JSX.Element => {
  const { formik, setCurrentStep } = props;

  const [isProceeding, setIsProceeding] = useState(false);

  const proceedToStepThree = () => {
    setIsProceeding(true);

    if (formik.values.participantSpecialization.length < 1) {
      handleInvalidFormData('Please enter a specialization.');
      return;
    }

    if (
      formik.values.participantObjectiveStatement.length < 1 ||
      formik.values.participantObjectiveStatement.length > 200
    ) {
      handleInvalidFormData(
        'Please enter an objective statement that is 200 characters or less.'
      );
      return;
    }

    setIsProceeding(false);
    setCurrentStep(3);
  };

  const handleInvalidFormData = (message: string) => {
    toast.warning(message);
    setIsProceeding(false);
  };

  return (
    <SetupSection>
      <SetupContent>
        <SetupParagraph>
          Great! Just a few more details and you’ll be finished with your own
          profile.
        </SetupParagraph>

        <ParticipantSpecializationField
          controlId="tftsParticipantSpecialization"
          fieldName="participantSpecialization"
          formik={formik}
        />

        <ParticipantObjectiveStatementField
          controlId="tftsParticipantObjectiveStatement"
          fieldName="participantObjectiveStatement"
          placeholder="Assume that you were looking for teams to join. In under 200 characters, describe what you would look for in those teams, as well as your skills, interests, ideas, or anything else you would want teams to know about you."
          formik={formik}
        />
      </SetupContent>

      <CenteredButtonWithMarginBottom
        size="lg"
        onClick={proceedToStepThree}
        disabled={isProceeding}
      >
        Continue
      </CenteredButtonWithMarginBottom>

      <CenteredButton
        variant="outline-secondary"
        onClick={() => setCurrentStep(1)}
        disabled={isProceeding}
      >
        Go Back
      </CenteredButton>
    </SetupSection>
  );
};

export default TeamStepTwo;
