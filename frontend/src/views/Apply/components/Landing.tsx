import React, { useState } from 'react';
import LinkButton from '../../../components/LinkButton';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components/macro';
import { MonoHeading } from 'commonStyles';
import { API_BASE } from 'index';

const Landing = (): JSX.Element => {
    const [email, setEmail] = useState<string>('');

    const handleSubmit = (event: Event) => {
        event.preventDefault();
        console.log(email);
        fetch(`${API_BASE}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
          }
        )
          .then(res => {
            if (res.status === 200) {
              console.log('success');
            } else {
              console.log('could not subscribe');
            }
          })
          .catch(err => {
            console.error(err);
          });
      }
    ;

    return (
      <ApplyContainer>
        <MonoHeading>Welcome!</MonoHeading>
        <StyledParagraph>
        <span role="text">
          Hack Brooklyn is back again for another 24 hours of innovation on <strong>March 20,
          2021.</strong> This year, we’re excited to announce that we will be accepting students from all schools!
        </span>
        </StyledParagraph>
        <StyledParagraph>
        <span role="text">
          <strong>Priority applications are now open!</strong> If you applied last year and/or are a
          Brooklyn College or CUNY student, apply now to hear back by <strong>February 1, 2021.</strong>
        </span>
        </StyledParagraph>

        <ApplyTextAndButton>
          <StyledParagraph center>Ready to begin your adventure? Apply now!</StyledParagraph>
          <ButtonContainer>
            <LinkButton to="/apply/priority" size="lg">
              Start Priority Application
            </LinkButton>
          </ButtonContainer>
        </ApplyTextAndButton>

        <StyledParagraph>
          Not a priority applicant? No problem! Enter your email below to join our mailing list and we’ll send you an
          email when applications go live to the public. <strong>You’ll also receive priority consideration for the
          general application!</strong>
        </StyledParagraph>

        <StyledForm onSubmit={handleSubmit}>
          <Form.Group controlId="newsletterEmail">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" value={email} onChange={(event) => setEmail(event.target.value)}
                          placeholder="email@example.com" required />
          </Form.Group>
          <Button type="submit" variant="info">
            Sign Up
          </Button>
        </StyledForm>
      </ApplyContainer>
    );
  }
;

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
  text-align: center;

  label {
    font-size: 1.25rem;
  }

  input {
    margin: 0 auto;
    width: 65%;
  }
`;

export default Landing;