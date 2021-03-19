import React from 'react';
import styled from 'styled-components/macro';

import { ApplicationDecisions, SubmittedApplication } from 'types';

import priorityApplicantIcon from 'assets/icons/application-labels/priority.svg';
import generalPriorityApplicantIcon from 'assets/icons/application-labels/general-priority.svg';

interface SummarySectionProps {
  applicationData: SubmittedApplication,
  applicationNumber: number
}

interface ApplicantLabelProps {
  icon: string;
  labelText: string;
}

const SummarySection = (props: SummarySectionProps): JSX.Element => {
  const { applicationData, applicationNumber } = props;

  return (
    <StyledSection>
      <ApplicantNameAndEmail>
        <ApplicantName>
          {applicationData.firstName} {applicationData.lastName}
        </ApplicantName>
        <ApplicantEmailLink href={`mailto:${applicationData.email}`}>
          {applicationData.email}
        </ApplicantEmailLink>
      </ApplicantNameAndEmail>

      <ApplicationNumber>
        Application #{applicationNumber}
      </ApplicationNumber>
      <ApplicationDecision>
        <span>Decision:&nbsp;</span>
        {applicationData.decision === ApplicationDecisions.Accepted && (
          <span style={{ color: 'green' }}>Accepted</span>
        )}

        {applicationData.decision === ApplicationDecisions.Rejected && (
          <span style={{ color: 'red' }}>Rejected</span>
        )}

        {applicationData.decision === ApplicationDecisions.Undecided && (
          <span style={{ color: 'gray' }}>Undecided</span>
        )}
      </ApplicationDecision>
      <ApplicantLabelContainer>
        {applicationData.priorityApplicant && (
          <ApplicantLabel
            icon={priorityApplicantIcon}
            labelText="Priority Applicant"
          />
        )}

        {applicationData.registeredInterest && (
          <ApplicantLabel
            icon={generalPriorityApplicantIcon}
            labelText="General Priority Applicant"
          />
        )}
      </ApplicantLabelContainer>
    </StyledSection>);
};

const ApplicantLabel = (props: ApplicantLabelProps): JSX.Element => {
  const { icon, labelText } = props;

  return (
    <ApplicantLabelContents>
      <ApplicantLabelIcon src={icon} alt={labelText} />
      <ApplicantLabelText>{labelText}</ApplicantLabelText>
    </ApplicantLabelContents>
  );
};

const StyledSection = styled.section`
  margin-bottom: 1rem;
`;

const ApplicantNameAndEmail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

const ApplicantName = styled.h2`
  font-size: 3rem;
  text-align: center;
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ApplicantEmailLink = styled.a`
  font-size: 1.5rem;
  font-weight: normal;
  text-decoration: none;
`;

const ApplicationNumber = styled.h3`
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ApplicationDecision = styled.h3`
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ApplicantLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ApplicantLabelContents = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 0.75rem;
`;

const ApplicantLabelIcon = styled.img`
  width: 1.75rem;
  height: 1.75rem;
`;

const ApplicantLabelText = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  margin-left: 0.5rem;
`;

export default SummarySection;
