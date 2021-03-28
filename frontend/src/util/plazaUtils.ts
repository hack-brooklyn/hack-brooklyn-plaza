import { History, LocationState } from 'history';
import { toast } from 'react-toastify';

import { Option } from 'types';

export const stringToTitleCase = (input: string): string => {
  return input.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generates options for react-select by mapping a string to each option's value and label.
 * @param items An array of strings to map to value-label pairs.
 * @return An array of react-select options.
 */
export const generateSelectOptions = (items: string[]): Option[] => {
  return items.map((item) => ({ value: item, label: item }));
};

/**
 * Logs an error to the console and toasts a user-friendly message to the user.
 * @param err The error to handle.
 */
export const handleError = (err: Error): void => {
  console.error(err);
  toast.error(err.message);
};

/**
 * Logs an error to the console, toasts a user-friendly message to the user, and reroutes to a path.
 * @param err The error to handle
 * @param history The `History` to use with pushing to a route.
 * @param path The path to push to. Defaults to '/' if no path is provided.
 */
export const handleErrorAndPush = (
  err: Error,
  history: History<LocationState>,
  path = '/'
): void => {
  handleError(err);
  history.push(path);
};

export const enumHasValue = (
  enumToTest: Record<string, unknown>,
  value: unknown
): boolean => {
  return Object.values(enumToTest).includes(value);
};
