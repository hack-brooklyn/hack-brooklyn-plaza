import React from 'react';
import { FastField } from 'formik';
import styled from 'styled-components/macro';
import Form from 'react-bootstrap/Form';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { MultiSelect, RequiredFormLabel } from 'components';
import { SetupFormGroup } from 'common/styles/commonStyles';
import { topicsAndSkillsOptions } from 'common/selectOptions/topicsAndSkillsOptions';
import {
  FormikModularFieldProps,
  ModularFieldProps,
  Option,
  TeamFormationParticipant,
  TeamFormationTeam
} from 'types';

interface TopicsAndSkillsSelectProps extends ModularFieldProps {
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  defaultValue?: Option[];
}

interface ParticipantBrowserVisibilityFieldProps
  extends FormikModularFieldProps {
  participantData: TeamFormationParticipant;
}

interface TeamBrowserVisibilityFieldProps extends FormikModularFieldProps {
  teamData: TeamFormationTeam;
}

export const TopicsAndSkillsSelect = (
  props: TopicsAndSkillsSelectProps
): JSX.Element => {
  const {
    controlId,
    fieldName,
    placeholder,
    multiSelectOptions,
    setMultiSelectOptions,
    defaultValue,
    disabled,
    children
  } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      {children}
      <FastField
        name={fieldName}
        component={MultiSelect}
        options={topicsAndSkillsOptions}
        defaultValue={defaultValue}
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
              'You have reached the limit of 5 topics and skills. Please remove a topic or skill to add another one.'
            );
          }
        }}
        disabled={disabled}
        required
      />
    </SetupFormGroup>
  );
};

// Participant form fields
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
        placeholder="Full Stack Developer, Java Developer, UX/UI Designer, etc."
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

export const ParticipantContactInfoField = (
  props: FormikModularFieldProps
): JSX.Element => {
  const { controlId, fieldName, formik } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      <RequiredFormLabel>Contact Info</RequiredFormLabel>
      <FastField
        as="textarea"
        className="form-control"
        name={fieldName}
        rows="5"
        maxlength="200"
        placeholder="Enter the best way for potential team members to contact you. For your safety, do not provide personal contact information (such as your email or phone number) and instead provide publicly available contact methods (like Discord)."
        disabled={formik.isSubmitting}
        required
      />
    </SetupFormGroup>
  );
};

export const ShowParticipantOnBrowserCheckbox = (
  props: ParticipantBrowserVisibilityFieldProps
): JSX.Element => {
  const { participantData, controlId, fieldName, formik } = props;

  return (
    <CheckboxContainer>
      <OverlayTrigger
        overlay={
          participantData.team !== null ? (
            <Tooltip
              id={`participant-profile-editor-${participantData.id}-ineligible-tooltip`}
            >
              You are already in a team! Only participants actively looking for
              a team can be shown on the participant browser.
            </Tooltip>
          ) : (
            <span />
          )
        }
      >
        <span>
          <FastField
            as={Form.Check}
            label="Show my profile on the participant browser"
            type="checkbox"
            name={fieldName}
            id={controlId}
            disabled={participantData.team !== null || formik.isSubmitting}
          />
        </span>
      </OverlayTrigger>
    </CheckboxContainer>
  );
};

// Team form fields
export const TeamNameField = (props: FormikModularFieldProps): JSX.Element => {
  const { controlId, fieldName, formik } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      <RequiredFormLabel>Team Name</RequiredFormLabel>
      <FastField
        as={Form.Control}
        name={fieldName}
        type="text"
        disabled={formik.isSubmitting}
        required
      />
    </SetupFormGroup>
  );
};

export const TeamObjectiveStatementField = (
  props: FormikModularFieldProps
): JSX.Element => {
  const { controlId, fieldName, formik } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      <RequiredFormLabel>Team Objective Statement</RequiredFormLabel>
      <FastField
        as="textarea"
        className="form-control"
        name={fieldName}
        rows="5"
        maxlength="200"
        placeholder="In under 200 characters, describe what your team is looking for in a potential team member."
        disabled={formik.isSubmitting}
        required
      />
    </SetupFormGroup>
  );
};

export const TeamSizeField = (props: FormikModularFieldProps): JSX.Element => {
  const { controlId, fieldName, formik } = props;

  return (
    <SetupFormGroup controlId={controlId}>
      <RequiredFormLabel>Team Size</RequiredFormLabel>
      <FastField
        as={Form.Control}
        name={fieldName}
        type="number"
        min="2"
        max="4"
        placeholder="Teams can have between 2 to 4 members."
        disabled={formik.isSubmitting}
        required
      />
    </SetupFormGroup>
  );
};

export const ShowTeamOnBrowserCheckbox = (
  props: TeamBrowserVisibilityFieldProps
): JSX.Element => {
  const { teamData, controlId, fieldName, formik } = props;

  return (
    <CheckboxContainer>
      <OverlayTrigger
        overlay={
          teamData.members.length >= teamData.size ? (
            <Tooltip id={`team-profile-editor-${teamData.id}-full-tooltip`}>
              Only teams with room left can be displayed on the team browser.
            </Tooltip>
          ) : (
            <span />
          )
        }
      >
        <span>
          <FastField
            as={Form.Check}
            label="Show team on the team browser"
            type="checkbox"
            name={fieldName}
            id={controlId}
            disabled={
              teamData?.members.length >= teamData?.size || formik.isSubmitting
            }
          />
        </span>
      </OverlayTrigger>
    </CheckboxContainer>
  );
};

const CheckboxContainer = styled.div`
  margin: 1rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;
