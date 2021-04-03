import React from 'react';
import { FastField } from 'formik';
import Form from 'react-bootstrap/Form';

import { RequiredFormLabel } from 'components';
import TopicsAndSkillsSelect from 'components/teamformation/TopicsAndSkillsSelect';
import {
  CenteredButton,
  CenteredButtonWithMarginBottom,
  SetupContent,
  SetupFormGroup,
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

        <SetupFormGroup controlId="tftsTeamName">
          <RequiredFormLabel>Team Name</RequiredFormLabel>
          <FastField
            as={Form.Control}
            name="teamName"
            type="text"
            disabled={formik.isSubmitting}
            required
          />
        </SetupFormGroup>

        <TopicsAndSkillsSelect
          controlId="tftsTeamInterestedTopicsAndSkills"
          fieldName="teamInterestedTopicsAndSkills"
          multiSelectOptions={multiSelectOptions}
          setMultiSelectOptions={setMultiSelectOptions}
          placeholder="Pick or enter 1 to 5 topics/skills that your team is interested in."
        >
          <RequiredFormLabel>Interested Topics and Skills</RequiredFormLabel>
        </TopicsAndSkillsSelect>

        <SetupFormGroup controlId="tftsTeamObjectiveStatement">
          <RequiredFormLabel>Team Objective Statement</RequiredFormLabel>
          <FastField
            as="textarea"
            className="form-control"
            name="teamObjectiveStatement"
            rows="5"
            maxlength="200"
            placeholder="In under 200 characters, describe what your team is looking for in a potential team member."
            disabled={formik.isSubmitting}
            required
          />
        </SetupFormGroup>

        <SetupFormGroup controlId="tftsTeamSize">
          <RequiredFormLabel>Team Size</RequiredFormLabel>
          <FastField
            as={Form.Control}
            name="teamSize"
            type="number"
            min="2"
            max="4"
            placeholder="Teams can have between 2 to 4 members."
            disabled={formik.isSubmitting}
            required
          />
        </SetupFormGroup>
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
