import React, { useState } from 'react';
import LinkButton from '../../../components/LinkButton';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components/macro';
import { toast } from 'react-toastify';
import startCase from 'lodash.startcase';
import { MonoHeading } from 'commonStyles';
import { API_ROOT } from 'index';

const Landing = (): JSX.Element => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSubmitting(true);

    const subscriberData = {
      firstName: firstName,
      lastName: lastName,
      email: email
    };

    let res;
    try {
      res = await fetch(`${API_ROOT}/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscriberData)
        }
      );
    } catch (err) {
      setSubmitting(false);
      toast.error('An error occurred while signing you up for the newsletter. Please try again.');
      console.error(err);
      return;
    }

    if (res.status === 400) {
      setSubmitting(false);
      const data = await res.json();

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

    setSubmitting(false);
    toast.success('Thank you for registering your interest! You will receive an email from us once registration opens to the public.');
  };

  return (
    <ApplyContainer>
      <MonoHeading>Welcome!</MonoHeading>
      <StyledParagraph>
        <span role="text">
          Hack Brooklyn is back again for another 48 hours of innovation on <strong>April 23,
          2021.</strong> This year, we’re excited to announce that we will be accepting students from all schools!
        </span>
      </StyledParagraph>
      <StyledParagraph>
        <span role="text">
          Priority applications are now open! If you applied to Hack Brooklyn last year and/or are a
          Brooklyn College student, apply now to hear back by <strong>March 29, 2021.</strong>
        </span>
      </StyledParagraph>

      <ApplyTextAndButton>
        <StyledParagraph center>Ready to begin your adventure? Apply now!</StyledParagraph>
        <ButtonContainer>
          <LinkButton to="/apply/form" size="lg">
            Start Priority Application
          </LinkButton>
        </ButtonContainer>
      </ApplyTextAndButton>

      <StyledParagraph>
        Not a priority applicant? No problem! Enter your info below to join our mailing list and we’ll send you an
        email when applications go live to the public. <strong>You’ll also receive priority consideration for the
        general application!</strong>
      </StyledParagraph>

      <StyledForm onSubmit={handleSubmit}>
        <NameFormContainer>
          <Form.Group controlId="interestFormFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text"
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          disabled={submitting}
                          required
            />
          </Form.Group>

          <Form.Group controlId="interestFormLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text"
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          disabled={submitting}
                          required
            />
          </Form.Group>
        </NameFormContainer>

        <Form.Group controlId="interestFormEmail">
          <Form.Label>Email Address</Form.Label>
          <Form.Control type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={submitting}
                        required
          />
        </Form.Group>
        <StyledSubmitButton type="submit" variant="info" disabled={submitting}>
          Register Interest
        </StyledSubmitButton>
      </StyledForm>
    </ApplyContainer>
  );
};

export const ApplyContainer = styled.section`
  max-width: 600px;
  margin: 0 auto;
`;

const StyledParagraph = styled.p<{
  center?: boolean
}>`
  font-size: 1.25rem;
  text-align: ${props => props.center ? 'center' : 'initial'};
`;

const ApplyTextAndButton = styled.div`
  margin: 1.5rem auto 3rem;
`;

const ButtonContainer = styled.div`
  text-align: center;
`;

const StyledForm = styled(Form)`
  margin: 0 auto;
  width: 80%;

  label {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  input {
    margin-bottom: 1rem;
  }

  @media screen and (min-width: 992px) {
    input {
      margin-bottom: 0;
    }
  }

`;

const NameFormContainer = styled.div`
  @media screen and (min-width: 992px) {
    margin-bottom: 1rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 1.5rem;
  }
`;

const StyledSubmitButton = styled(Button)`
  display: block;
  margin: 1.25rem auto 0;
`;

export default Landing;
