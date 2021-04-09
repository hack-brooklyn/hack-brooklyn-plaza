import React from 'react';
import uniq from 'lodash/uniq';
import { FieldProps } from 'formik';
import Select from 'react-select/creatable';
import { OptionsType, ValueType } from 'react-select';

import { handleError } from 'util/plazaUtils';
import { Option } from 'types';

interface CustomSelectProps extends FieldProps {
  options: OptionsType<Option>;
  isMulti?: boolean;
  className?: string;
  placeholder?: string;
  multiSelectOptions: Option[];
  setMultiSelectOptions: React.Dispatch<React.SetStateAction<Option[]>>;
  defaultValue?: Option[];
  disabled?: boolean;
  additionalCheck?: (options: Option[]) => void;
}

export const MultiSelect = ({
  className,
  placeholder,
  field,
  form,
  multiSelectOptions,
  setMultiSelectOptions,
  defaultValue,
  disabled,
  additionalCheck
}: CustomSelectProps): JSX.Element => {
  const onChange = (options: ValueType<Option | Option[], boolean>) => {
    if (Array.isArray(options) && options.length > 0) {
      if (additionalCheck) {
        try {
          additionalCheck(options);
        } catch (err) {
          handleError(err);
          return;
        }
      }

      form.setFieldValue(
        field.name,
        options.map((item: Option) => item.value)
      );

      // Add user-created options to the displayed options list
      const newOptions = uniq([...multiSelectOptions, ...options]);
      setMultiSelectOptions(newOptions);
    } else {
      // The user may have deleted all of the values
      form.setFieldValue(field.name, []);
    }
  };

  const getValue = () => {
    if (Array.isArray(multiSelectOptions) && multiSelectOptions.length > 0) {
      return multiSelectOptions.filter(
        (option) => field.value.indexOf(option.value) >= 0
      );
    } else {
      return [];
    }
  };

  return (
    <Select
      className={className}
      name={field.name}
      value={getValue()}
      onChange={onChange}
      placeholder={placeholder}
      options={multiSelectOptions}
      defaultValue={defaultValue}
      isMulti={true}
      isDisabled={disabled}
    />
  );
};

export default MultiSelect;
