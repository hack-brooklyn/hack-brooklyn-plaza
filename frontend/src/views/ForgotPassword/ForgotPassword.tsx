import React, { useEffect, useState } from 'react';
import queryString from 'query-string';

import { StyledCenteredMarginH1 } from 'commonStyles';
import ResetPasswordForm from './components/ResetPasswordForm';
import ResetPasswordRequestForm from './components/ResetPasswordRequestForm';

const ForgotPassword = (): JSX.Element => {
  const [keyExists, setKeyExists] = useState(false);

  useEffect(() => {
    const parsed = queryString.parse(location.search);
    if (parsed.key) {
      setKeyExists(true);
    }
  }, []);

  return (
    <>
      <StyledCenteredMarginH1>Reset Password</StyledCenteredMarginH1>
      {keyExists ? <ResetPasswordForm /> : <ResetPasswordRequestForm />}
    </>
  );
};

export default ForgotPassword;
