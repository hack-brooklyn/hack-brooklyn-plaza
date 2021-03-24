import { InvalidPathParametersError } from 'types';

export const checkApplicationPageParams = (
  applicationNumberParam: string | undefined
): number => {
  // Try to parse application number from path
  if (applicationNumberParam === undefined) {
    throw new InvalidPathParametersError(
      'Please specify an application number in the URL.'
    );
  }

  // Application number must be an integer to be sent to the backend
  const parsedApplicationNumber = parseInt(applicationNumberParam);
  if (isNaN(parsedApplicationNumber)) {
    throw new InvalidPathParametersError(
      'The application number in the URL is invalid.'
    );
  }

  return parsedApplicationNumber;
};
