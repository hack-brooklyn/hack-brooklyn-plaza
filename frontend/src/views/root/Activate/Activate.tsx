import React, { useEffect, useState } from 'react';
import queryString from 'query-string';

import { ActivateForm, ActivateRequestForm } from './components';
import { StyledCenteredMarginH1 } from 'common/styles/commonStyles';

const Activate = (): JSX.Element => {
  const [keyExists, setKeyExists] = useState(false);

  useEffect(() => {
    const parsed = queryString.parse(location.search);
    if (parsed.key) {
      setKeyExists(true);
    }
  }, []);

  return (
    <>
      <StyledCenteredMarginH1>Activate Your Account</StyledCenteredMarginH1>
      {keyExists ? <ActivateForm /> : <ActivateRequestForm />}
    </>
  );
};

export default Activate;
