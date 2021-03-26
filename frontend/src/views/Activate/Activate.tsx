import React, { useEffect, useState } from 'react';
import queryString from 'query-string';

import { StyledCenteredMarginH1 } from 'commonStyles';
import ActivateForm from './components/ActivateForm';
import ActivateRequestForm from './components/ActivateRequestForm';

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
