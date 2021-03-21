import { toast } from 'react-toastify';

export const handleError = (err: Error): void => {
  console.error(err);
  toast.error(err.message);
};
