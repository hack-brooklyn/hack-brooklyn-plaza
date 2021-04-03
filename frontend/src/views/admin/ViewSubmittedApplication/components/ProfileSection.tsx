import React from 'react';
import styled from 'styled-components/macro';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { SubmittedApplication } from 'types';

interface ApplicantProfileFieldProps {
  name: string;
  value: string | number | boolean | null;
}

interface ProfileSectionProps {
  applicationData: SubmittedApplication;
}

const ProfileSection = (props: ProfileSectionProps): JSX.Element => {
  const { applicationData } = props;

  return (
    <StyledSection>
      <Row>
        <Col md={6}>
          <ApplicantProfileField
            name="Country"
            value={applicationData.country}
          />

          <ApplicantProfileField
            name="Gender"
            value={applicationData.gender}
          />

          <ApplicantProfileField
            name="Pronouns"
            value={applicationData.pronouns}
          />

          <ApplicantProfileField
            name="Ethnicity"
            value={applicationData.ethnicity}
          />

          <ApplicantProfileField
            name="Shirt Size"
            value={applicationData.shirtSize}
          />

          <ApplicantProfileField
            name="First Hackathon"
            value={applicationData.isFirstHackathon ? 'Yes' : 'No'}
          />

          {!applicationData.isFirstHackathon && (
            <ApplicantProfileField
              name="Hackathons Attended"
              value={applicationData.numberHackathonsAttended}
            />
          )}
        </Col>

        <Col md={6}>
          <ApplicantProfileField
            name="School"
            value={applicationData.school}
          />

          <ApplicantProfileField
            name="Level of Study"
            value={applicationData.levelOfStudy}
          />

          <ApplicantProfileField
            name="Graduation Year"
            value={applicationData.graduationYear}
          />

          <ApplicantProfileField
            name="Major"
            value={applicationData.major}
          />
        </Col>
      </Row>
    </StyledSection>
  );
};

const ApplicantProfileField = (
  props: ApplicantProfileFieldProps
): JSX.Element => {
  const { name, value } = props;

  return (
    <ApplicantProfileFieldContents>
      <strong>{name}:</strong> {value !== null ? value : 'Not Provided'}
    </ApplicantProfileFieldContents>
  );
};

const StyledSection = styled.section`
  max-width: 800px;
  margin: 0 auto 2rem;
  border: 3px solid lightgray;
  border-radius: 1rem;
  padding: 1rem 1rem 1rem 1.25rem;
`;

const ApplicantProfileFieldContents = styled.div`
  font-size: 1.25rem;
  margin-top: 0.125rem;
  margin-bottom: 0.125rem;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export default ProfileSection;
