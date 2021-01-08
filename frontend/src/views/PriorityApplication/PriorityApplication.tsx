import React from 'react';
import styled from 'styled-components/macro';
import { MonoHeading } from 'commonStyles';
import ApplicationForm from 'views/PriorityApplication/components/ApplicationForm';

const PriorityApplication = () => {
  return (
    <ApplicationContainer>
      <MonoHeading>Hack Brooklyn Priority Application</MonoHeading>
      <ApplicationForm />
    </ApplicationContainer>
  );
};

const ApplicationContainer = styled.section`
  max-width: 800px;
  margin: 0 auto;
`

export default PriorityApplication;