import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { MonoHeading } from 'commonStyles';
import ApplicationForm from 'views/EventApplicationForm/components/ApplicationForm';
import ApplicationSuccess from 'views/EventApplicationForm/components/ApplicationSuccess';

const EventApplicationForm = (): JSX.Element => {
  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);

  return (
    <ApplicationContainer>
      <MonoHeading>
        <span role="text">
          Hack Brooklyn<br />Priority Application
        </span>
      </MonoHeading>

      <section>
        {!applicationSubmitted ? (
          <ApplicationForm setApplicationSubmitted={setApplicationSubmitted} />
        ) : (
          <ApplicationSuccess />
        )}
      </section>
    </ApplicationContainer>
  );
};

const ApplicationContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export default EventApplicationForm;
