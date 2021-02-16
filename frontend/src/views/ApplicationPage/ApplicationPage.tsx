import React, { useState } from 'react';
import styled from 'styled-components/macro';

import { ApplicationForm, ApplicationSuccess } from 'views/ApplicationPage/components';
import PriorityQualificationCheck from 'views/ApplicationPage/components/PriorityQualificationCheck';
import { MonoHeading } from 'commonStyles';

export const PRIORITY_APPLICATIONS_ACTIVE = true;

const ApplicationPage = (): JSX.Element => {
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [isPriorityApplicant, setIsPriorityApplicant] = useState(false);
  const [priorityApplicantEmail, setPriorityApplicantEmail] = useState('');

  return (
    <ApplicationContainer>
      <MonoHeading>
        <span role="text">
          Hack Brooklyn<br />{PRIORITY_APPLICATIONS_ACTIVE && 'Priority '}Application
        </span>
      </MonoHeading>

      <section>
        {(!PRIORITY_APPLICATIONS_ACTIVE || isPriorityApplicant) ? (
          <>
            {applicationSubmitted ? (
              <ApplicationSuccess />
            ) : (
              <ApplicationForm setApplicationSubmitted={setApplicationSubmitted}
                               priorityApplicantEmail={priorityApplicantEmail} />
            )}
          </>
        ) : (
          <PriorityQualificationCheck
            isPriorityApplicant={isPriorityApplicant}
            setIsPriorityApplicant={setIsPriorityApplicant}
            setPriorityApplicantEmail={setPriorityApplicantEmail}
          />
        )}
      </section>
    </ApplicationContainer>
  );
};

const ApplicationContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export default ApplicationPage;
