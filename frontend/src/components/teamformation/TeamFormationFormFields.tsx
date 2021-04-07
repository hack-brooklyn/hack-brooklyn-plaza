import React from 'react';
import { FormikModularFieldProps, ModularFieldProps, Option } from 'types';
import { SetupFormGroup } from 'common/styles/commonStyles';
import { MultiSelect, RequiredFormLabel } from 'components/index';
import { FastField } from 'formik';
import Form from 'react-bootstrap/Form';
import { topicsAndSkillsOptions } from 'common/selectOptions/topicsAndSkillsOptions';

interface TopicsAndSkillsSelectProps extends ModularFieldProps {
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  defaultValue?: Option[];
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
