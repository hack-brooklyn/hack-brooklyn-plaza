import React from 'react';
import Form from 'react-bootstrap/Form';
import { StyledFieldset } from 'views/EventApplicationForm/styles';
import { FastField } from 'formik';
import RequiredAsterisk from 'components/RequiredAsterisk';

const Agreements = (): JSX.Element => {
  return (
    <StyledFieldset>
      <Form.Check>
        <FastField
          as={Form.Check.Input}
          name="acceptTocAndCoc"
          id="applicationTocAndCoc"
          required
        />
        <Form.Check.Label htmlFor="applicationTocAndCoc">
          I have read and agree to the Hack Brooklyn <TermsAndConditions /> and <CodeOfConduct />.<RequiredAsterisk />
        </Form.Check.Label>
      </Form.Check>
      <FastField
        as={Form.Check}
        label="I authorize Hack Brooklyn to share my resume with sponsoring organizations for recruitment and hiring purposes."
        type="checkbox"
        name="shareResumeWithSponsors"
        id="applicationShareResume"
        style={{ marginTop: '0.5rem' }}
      />
    </StyledFieldset>
  );
};

const TermsAndConditions = () => {
  return (
    <a href="http://www.google.com">
      Terms and Conditions
    </a>
  );
};

const CodeOfConduct = () => {
  return (
    <a href="http://www.google.com">
      Code of Conduct
    </a>
  );
};

export default Agreements;
