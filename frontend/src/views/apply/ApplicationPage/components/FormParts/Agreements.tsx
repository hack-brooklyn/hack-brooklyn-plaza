import React from 'react';
import { FastField } from 'formik';
import Form from 'react-bootstrap/Form';

import { RequiredAsterisk } from 'components';
import { StyledFieldset } from 'common/styles/apply/applicationPageStyles';
import { FormPartProps } from '../ApplicationForm';

const Agreements = (props: FormPartProps): JSX.Element => {
  const { formik } = props;

  return (
    <StyledFieldset>
      <Form.Check>
        <FastField
          as={Form.Check.Input}
          name="acceptTocAndCoc"
          id="applicationTocAndCoc"
          disabled={formik.isSubmitting}
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
        disabled={formik.isSubmitting}
        style={{ marginTop: '0.5rem' }}
      />
    </StyledFieldset>
  );
};

const TermsAndConditions = () => {
  return (
    <a href="https://hackbrooklyn.org/files/termsandconditions.pdf" target="_blank" rel="noopener noreferrer">
      Terms and Conditions
    </a>
  );
};

const CodeOfConduct = () => {
  return (
    <a href="https://hackbrooklyn.org/files/codeofconduct.pdf" target="_blank" rel="noopener noreferrer">
      Code of Conduct
    </a>
  );
};

export default Agreements;
