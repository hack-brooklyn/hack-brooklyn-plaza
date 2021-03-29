import React, { useState } from 'react';
import { toast } from 'react-toastify';

import {
  InterestedTopicsAndSkillsSelect,
  validateInterestedTopicsAndSkills
} from 'views/TeamFormationParticipantSetup/components/ParticipantStepOne';
import {
  TFHomeButton,
  TFLinkButtonContainer
} from 'common/styles/teamFormationSetupStyles';
import {
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupParagraph,
  SetupSection
} from 'commonStyles';
import { TeamSetupStepPropsMultiSelect } from 'views/TeamFormationTeamSetup/TeamFormationTeamSetup';

const TeamStepOne = (props: TeamSetupStepPropsMultiSelect): JSX.Element => {
  const {
    formik,
    setCurrentStep,
    multiSelectOptions,
    setMultiSelectOptions
  } = props;

  const [isProceeding, setIsProceeding] = useState(false);

  const proceedToStepTwo = () => {
    setIsProceeding(true);

    try {
      validateInterestedTopicsAndSkills(
        formik.values.participantInterestedTopicsAndSkills
      );
    } catch (err) {
      handleInvalidFormData(err.message);
      return;
    }

    setIsProceeding(false);
    setCurrentStep(2);
  };

  const handleInvalidFormData = (message: string) => {
    toast.warning(message);
    setIsProceeding(false);
  };

  return (
    <SetupSection>
      <SetupContent>
        <SetupParagraph>
          As a team searching for members, you and your team will be able to
          browse participants looking for a team and send them invitations to
          join your team.
        </SetupParagraph>

        <SetupParagraph>
          Let’s get started! We’ll first set up your own participant profile.
          Pick 1 to 5 topics/skills below that interest you, or enter your own
          topic/skill to add one.
        </SetupParagraph>

        <InterestedTopicsAndSkillsSelect
          controlId="tftsParticipantInterestedTopicsAndSkills"
          fieldName="participantInterestedTopicsAndSkills"
          multiSelectOptions={multiSelectOptions}
          setMultiSelectOptions={setMultiSelectOptions}
        />
      </SetupContent>

      <CenteredButtonWithMarginBottom
        size="lg"
        onClick={proceedToStepTwo}
        disabled={isProceeding}
      >
        Continue
      </CenteredButtonWithMarginBottom>

      <TFLinkButtonContainer>
        <TFHomeButton variant="outline-secondary" to="/teamformation">
          Back to Selection
        </TFHomeButton>
      </TFLinkButtonContainer>
    </SetupSection>
  );
};
export default TeamStepOne;