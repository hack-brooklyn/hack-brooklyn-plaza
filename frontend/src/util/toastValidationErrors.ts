import startCase from 'lodash.startcase';
import { toast } from 'react-toastify';

interface Errors {
  field: string;
  errorMessage: string;
}

/**
 * Pretty-prints and toasts validation errors from a submitted form.
 * @param errors An object with the errors to toast.
 */
export const toastValidationErrors = (errors: Errors): void => {
  toast.error('Some of the submitted data doesn\'t look right. Please correct the following errors and try again.', {
    autoClose: 15000
  });

  for (const [field, errorMessage] of Object.entries(errors)) {
    toast.error(`${startCase(field)} ${errorMessage}.`, {
      autoClose: 15000
    });
  }
};
