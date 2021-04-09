import React from 'react';

import {
  TeamNameField,
  TeamObjectiveStatementField,
  TeamSizeField,
  TopicsAndSkillsSelect
} from 'components/teamformation/TeamFormationFormFields';
import { RequiredFormLabel } from 'components';
import {
  CenteredButton,
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupParagraph,
  SetupSection
} from 'common/styles/commonStyles';
import { TeamSetupStepPropsMultiSelect } from '../TeamFormationTeamSetup';

const TeamStepThree = (props: TeamSetupStepPropsMultiSelect): JSX.Element => {
  const {
    formik,
    setCurrentStep,
    multiSelectOptions,
    setMultiSelectOptions
  } = props;

  return (
    <SetupSection>
      <SetupContent>
        <SetupParagraph>
          Your profile is now complete! Finally, let’s create your team’s
          profile.
        </SetupParagraph>

        <TeamNameField
          formik={formik}
          controlId="tftsTeamName"
          fieldName="teamName"
        />

        <TopicsAndSkillsSelect
          controlId="tftsTeamInterestedTopicsAndSkills"
          fieldName="teamInterestedTopicsAndSkills"
          multiSelectOptions={multiSelectOptions}
          setMultiSelectOptions={setMultiSelectOptions}
          placeholder="Pick or enter 1 to 5 topics/skills that your team is interested in."
        >
          <RequiredFormLabel>Interested Topics and Skills</RequiredFormLabel>
        </TopicsAndSkillsSelect>

        <TeamObjectiveStatementField
          formik={formik}
          controlId="tftsTeamObjectiveStatement"
          fieldName="teamObjectiveStatement"
        />

        <TeamSizeField
          formik={formik}
          controlId="tftsTeamSize"
          fieldName="teamSize"
        />
      </SetupContent>

      <CenteredButtonWithMarginBottom
        type="submit"
        size="lg"
        disabled={formik.isSubmitting}
      >
        Create Team
      </CenteredButtonWithMarginBottom>

      <CenteredButton
        variant="outline-secondary"
        onClick={() => setCurrentStep(2)}
        disabled={formik.isSubmitting}
      >
        Go Back
      </CenteredButton>
    </SetupSection>
  );
};

export default TeamStepThree;
