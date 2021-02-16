import React, { useState } from 'react';
import RequiredFormLabel from 'components/RequiredFormLabel';
import Form from 'react-bootstrap/Form';
import { StyledSubmitButton } from 'views/ApplicationPage/components/ApplicationForm';
import { toast } from 'react-toastify';
import styled from 'styled-components/macro';
import { API_ROOT } from 'index';
import { Alert } from 'react-bootstrap';

interface PriorityQualificationCheckProps {
  isPriorityApplicant: boolean;
  setIsPriorityApplicant: React.Dispatch<React.SetStateAction<boolean>>
  setPriorityApplicantEmail: React.Dispatch<React.SetStateAction<string>>
}

const PriorityQualificationCheck = (props: PriorityQualificationCheckProps): JSX.Element => {
  const { isPriorityApplicant, setIsPriorityApplicant, setPriorityApplicantEmail } = props;

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  const checkPriorityEligibility = async () => {
    setSubmitting(true);

    const checkPriorityEligibilityBody = {
      email: email
    };

    let resData;
    try {
      const res = await fetch(`${API_ROOT}/apply/checkPriorityEligibility`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkPriorityEligibilityBody)
        }
      );
      resData = await res.json();
    } catch (err) {
      toast.error('An error occurred while trying to verify your eligibility. Please try again.');
      setSubmitting(false);
      return;
    }

    if (resData.eligible) {
      setIsPriorityApplicant(true);
      setPriorityApplicantEmail(email);
      toast.success('Congratulations! You are eligible to apply as a priority applicant. Finish filling out the form before general applications open to receive priority consideration for Hack Brooklyn!');
    }

    setEligibilityChecked(true);
    setSubmitting(false);
  };

  return (
    <div>
      <DescriptionContainer>
        <p>Applications for Hack Brooklyn are now live for priority applicants! If you fall into one of the categories
          below, you are eligible to apply as a priority applicant.
        </p>

        <ul>
          <li>Previous Hack Brooklyn Applicant or Participant</li>
          <li>Brooklyn College Student</li>
        </ul>

        <p>To start your application, enter the email you applied to Hack Brooklyn with previously or your Brooklyn
          College email below
          and click &quot;Check Eligibility&quot;.</p>
      </DescriptionContainer>

      <form onSubmit={(e) => {
        e.preventDefault();
        checkPriorityEligibility();
      }}>
        <Form.Group controlId="priorityCheckEmail">
          <RequiredFormLabel>Previous Applicant Email or Brooklyn College Email</RequiredFormLabel>
          <Form.Control
            name="email"
            type="email"
            onChange={e => setEmail(e.target.value)}
            value={email}
            disabled={submitting}
            required />
        </Form.Group>

        <StyledSubmitButton type="submit" size="lg" disabled={submitting}>Check Eligibility</StyledSubmitButton>
      </form>

      {eligibilityChecked && !submitting && !isPriorityApplicant && (
        <Alert variant="warning">
          Unfortunately, the email you provided is not eligible for priority consideration at this time.
        </Alert>
      )}
    </div>
  );
};

const DescriptionContainer = styled.div`
  margin-top: 2rem;
  font-size: 1.25rem;
`;

export default PriorityQualificationCheck;
