import { History, LocationState } from 'history';
import { toast } from 'react-toastify';

export const stringToTitleCase = (input: string): string => {
  return input.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
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
export const handleErrorAndPush = (err: Error, history: History<LocationState>, path = '/'): void => {
  handleError(err);
  history.push(path);
};

export const enumHasValue = (enumToTest: Record<string, unknown>, value: unknown): boolean => {
  return Object.values(enumToTest).includes(value);
};
