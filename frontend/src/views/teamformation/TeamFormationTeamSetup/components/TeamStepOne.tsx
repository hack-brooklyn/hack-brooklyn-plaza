import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { TopicsAndSkillsSelect } from 'components/teamformation/TeamFormationFormFields';
import {
  TFHomeButton,
  TFLinkButtonContainer
} from 'common/styles/teamformation/teamFormationSetupStyles';
import {
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupParagraph,
  SetupSection
} from 'common/styles/commonStyles';
import { validateTopicsAndSkills } from 'util/teamFormation';
import { TeamSetupStepPropsMultiSelect } from '../TeamFormationTeamSetup';

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
      validateTopicsAndSkills(
        formik.values.participantInterestedTopicsAndSkills
      );
    } catch (err) {
      toast.warning(err.message);
      setIsProceeding(false);
      return;
    }

    setIsProceeding(false);
    setCurrentStep(2);
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

        <TopicsAndSkillsSelect
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
