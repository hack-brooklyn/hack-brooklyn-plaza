import React, { useState } from 'react';
import { toast } from 'react-toastify';

import TopicsAndSkillsSelect, {
  validateTopicsAndSkills
} from 'components/TeamFormation/TopicsAndSkillsSelect';
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
import { ParticipantSetupStepPropsMultiSelect } from '../TeamFormationParticipantSetup';

const ParticipantStepOne = (
  props: ParticipantSetupStepPropsMultiSelect
): JSX.Element => {
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
      validateTopicsAndSkills(formik.values.interestedTopicsAndSkills);
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
          As a participant searching for a team, you’ll be able to browse teams
          currently looking for new members. You’ll also be able to browse other
          participants looking for a team and request to start a new team with
          them.
        </SetupParagraph>

        <SetupParagraph>
          Let’s get started on setting up your participant profile! Pick 1 to 5
          topics/skills below that interest you, or enter your own topic/skill
          to add one.
        </SetupParagraph>

        <TopicsAndSkillsSelect
          controlId="tfpsInterestedTopicsAndSkills"
          fieldName="interestedTopicsAndSkills"
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

export default ParticipantStepOne;
