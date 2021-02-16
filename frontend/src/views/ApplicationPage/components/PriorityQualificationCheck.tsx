import React, { useState } from 'react';
import RequiredFormLabel from 'components/RequiredFormLabel';
import Form from 'react-bootstrap/Form';
import { StyledSubmitButton } from 'views/ApplicationPage/components/ApplicationForm';
import { toast } from 'react-toastify';
import styled from 'styled-components/macro';
import { API_ROOT } from 'index';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import startCase from 'lodash.startcase';

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

    let res;
    try {
      res = await fetch(`${API_ROOT}/apply/checkPriorityEligibility`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(checkPriorityEligibilityBody)
        }
      );
    } catch (err) {
      toast.error('An error occurred while trying to verify your eligibility. Please try again.');
      setSubmitting(false);
      return;
    }

    const data = await res.json();

    if (res.status === 400) {
      setSubmitting(false);

      toast.error('Some of your submitted data doesn\'t look right. Please correct the following errors and try again.', {
        autoClose: 15000
      });
      for (const [field, errorMessage] of Object.entries(data.errors)) {
        toast.error(`${startCase(field)} ${errorMessage}.`, {
          autoClose: 15000
        });
      }

      return;
    }

    if (data.eligible) {
      // Change view to the form
      setIsPriorityApplicant(true);
      setPriorityApplicantEmail(email);
      toast.success('Congratulations! You are eligible to apply as a priority applicant. Finish filling out the form before general applications open to receive priority consideration for Hack Brooklyn!');
    } else {
      // Scroll down to the alert box
      setTimeout(() => {
        scrollBy(0, window.innerHeight);
      }, 100);
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

        <StyledSubmitButton type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Checking...' : 'Check Eligibility'}
        </StyledSubmitButton>
      </form>

      {eligibilityChecked && !submitting && !isPriorityApplicant && (
        <Alert variant="warning">
          <p>
            Unfortunately, the email you entered is not eligible for priority consideration at this time. However, you
            can still register your interest to receive priority consideration for the general application!
          </p>

          <Link to="/apply">Click here to visit the interest form and register your interest.</Link>
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
