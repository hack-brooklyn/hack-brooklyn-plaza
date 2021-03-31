import React from 'react';
import { FastField } from 'formik';

import { MultiSelect } from 'components';
import { SetupFormGroup } from 'commonStyles';
import { defaultTopicsAndSkills } from 'common/defaultTopicsAndSkills';
import { ModularFieldProps, Option } from 'types';

interface TopicsAndSkillsSelectProps extends ModularFieldProps {
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}

const TopicsAndSkillsSelect = (
  props: TopicsAndSkillsSelectProps
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
              'You have reached the limit of 5 topics and skills. Please remove a topic or skill to add another one.'
            );
          }
        }}
        required
      />
    </SetupFormGroup>
  );
};

export const validateTopicsAndSkills = (topicsAndSkills: string[]): void => {
  if (topicsAndSkills.length < 1 || topicsAndSkills.length > 5) {
    throw new Error('Please select 1 to 5 topics to continue.');
  }
};

export default TopicsAndSkillsSelect;
