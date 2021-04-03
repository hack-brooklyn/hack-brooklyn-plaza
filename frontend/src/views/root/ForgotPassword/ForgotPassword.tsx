import React, { useEffect, useState } from 'react';
import queryString from 'query-string';

import { ResetPasswordForm, ResetPasswordRequestForm } from './components';
import { StyledCenteredMarginH1 } from 'common/styles/commonStyles';

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
