import React, { useState } from 'react';
import { FastField } from 'formik';
import { toast } from 'react-toastify';

import { MultiSelect } from 'components';
import {
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupFormGroup,
  SetupParagraph,
  SetupSection
} from 'commonStyles';
import {
  TFHomeButton,
  TFLinkButtonContainer
} from 'common/styles/teamFormationSetupStyles';
import { defaultTopicsAndSkills } from 'common/defaultTopicsAndSkills';
import { ParticipantSetupStepPropsMultiSelect } from '../TeamFormationParticipantSetup';
import { ModularFieldProps, Option } from 'types';

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
      validateInterestedTopicsAndSkills(
        formik.values.interestedTopicsAndSkills
      );
    } catch (err) {
      handleInvalidFormData(err.message);
      return;
    }

    console.log(formik.values.interestedTopicsAndSkills);

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

        <InterestedTopicsAndSkillsSelect
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

export const validateInterestedTopicsAndSkills = (
  interestedTopicsAndSkills: string[]
): void => {
  if (
    interestedTopicsAndSkills.length < 1 ||
    interestedTopicsAndSkills.length > 5
  ) {
    throw new Error('Please select 1 to 5 topics to continue.');
  }
};

interface InterestedTopicsAndSkillsSelectProps extends ModularFieldProps {
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}

export const InterestedTopicsAndSkillsSelect = (
  props: InterestedTopicsAndSkillsSelectProps
): JSX.Element => {
  const {
    controlId,
    fieldName,
    placeholder,
    multiSelectOptions,
    setMultiSelectOptions,
    children
  } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      {children}
      <FastField
        name={fieldName}
        component={MultiSelect}
        options={defaultTopicsAndSkills}
        placeholder={
          placeholder === undefined
            ? 'Search for topics/skills...'
            : placeholder
        }
        multiSelectOptions={multiSelectOptions}
        setMultiSelectOptions={setMultiSelectOptions}
        additionalCheck={(options: Option[]) => {
          if (options.length > 5) {
            throw new Error(
              'You have reached the limit of 5 topics and skills. Please remove a selected topic or skill to add another one.'
            );
          }
        }}
        required
      />
    </SetupFormGroup>
  );
};

export default ParticipantStepOne;
