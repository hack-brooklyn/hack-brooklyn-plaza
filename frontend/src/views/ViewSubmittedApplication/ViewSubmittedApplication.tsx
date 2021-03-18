import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled, { css } from 'styled-components/macro';
import Button from 'react-bootstrap/Button';

import { LinkButton } from 'components';
import { LinksSection, ProfileSection, ShortResponseSection, SummarySection } from './components';
import { ButtonActiveOverrideStyles, HeadingSection, StyledH1 } from 'commonStyles';
import { refreshAccessToken } from 'util/auth';
import { API_ROOT } from 'index';
import {
  ConnectionError,
  InvalidPathParametersError,
  NoPermissionError,
  RootState,
  SubmittedApplication,
  UnknownError
} from 'types';

interface PageParams {
  applicationNumberParam?: string;
}

interface HeadingButtonsProps {
  pageReady: boolean;
}

const ViewSubmittedApplication = (): JSX.Element => {
  const history = useHistory();
  const { applicationNumberParam } = useParams<PageParams>();

  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);
  const reviewModeOn = useSelector((state: RootState) => state.admin.applicationReviewModeOn);

  const [pageReady, setPageReady] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState(-1);
  const [applicationData, setApplicationData] = useState<SubmittedApplication>();

  useEffect(() => {
    // Try to parse application number from path
    if (applicationNumberParam === undefined) {
      throw new InvalidPathParametersError(
        'Please specify an application number in the URL.'
      );
    }

    // Application number must be an integer to be sent to the backend
    const parsedApplicationNumber = parseInt(applicationNumberParam);
    if (isNaN(parsedApplicationNumber)) {
      throw new InvalidPathParametersError(
        'The application number in the URL is invalid.'
      );
    }

    // Set and retrieve the current application data
    setApplicationNumber(parsedApplicationNumber);
    getApplicationData(parsedApplicationNumber).catch((err) => {
      console.error(err);
      toast.error(err.message);
    });
  }, []);

  const getApplicationData = async (appNumber: number, overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/applications/${appNumber}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: SubmittedApplication = await res.json();
      setApplicationData(resBody);
      setPageReady(true);
    } else if (res.status === 401) {
      refreshAccessToken(history)
        .then((refreshedToken) => getApplicationData(appNumber, refreshedToken))
        .catch((err) => toast.error(err.message));
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const deleteApplication = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/applications/${applicationNumber}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      toast.success('The application has been deleted.');
      history.push('/admin/applications');
    } else if (res.status === 401) {
      refreshAccessToken(history)
        .then((refreshedToken) => deleteApplication(refreshedToken))
        .catch((err) => toast.error(err.message));
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const promptDeleteApplication = () => {
    const deleteConfirmation = prompt(
      'Are you sure you want to delete this application? This action is irreversible! Type in "DELETE" (in capital letters) to confirm.'
    );

    if (deleteConfirmation === 'DELETE') {
      deleteApplication();
    } else {
      toast.warning('Application deletion has been cancelled.');
    }
  };

  return (
    <>
      <HeadingSection>
        <StyledH1>View Application</StyledH1>

        <HeadingButtons>
          {reviewModeOn
            ? <ReviewModeButtons pageReady={pageReady} />
            : <ManageApplicationButtons pageReady={pageReady} />}
        </HeadingButtons>
      </HeadingSection>

      {pageReady && applicationData && (
        <>
          <SummarySection
            applicationData={applicationData}
            applicationNumber={applicationNumber} />

          <ProfileSection
            applicationData={applicationData} />

          <ShortResponseSection
            applicationData={applicationData} />

          <LinksSection
            applicationData={applicationData}
            applicationNumber={applicationNumber} />

          <DeleteApplicationButton
            variant="outline-danger"
            size="sm"
            onClick={promptDeleteApplication}
          >
            Delete Application
          </DeleteApplicationButton>
        </>
      )}
    </>
  );
};

const ReviewModeButtons = (props: HeadingButtonsProps): JSX.Element => {
  const { pageReady } = props;

  return (
    <>
      {pageReady && (
        <>
          <StyledButton variant="success">Accept</StyledButton>
          <StyledButton variant="danger">Reject</StyledButton>
          <StyledButton variant="secondary">Decide Later</StyledButton>
        </>
      )}

      <StyledButton variant="primary">Exit Review Mode</StyledButton>;
    </>
  );
};

const ManageApplicationButtons = (props: HeadingButtonsProps): JSX.Element => {
  const { pageReady } = props;

  return (
    <>
      {pageReady && (
        <>
          <StyledButton variant="success">Set Accepted</StyledButton>
          <StyledButton variant="danger">Set Rejected</StyledButton>
          <StyledButton variant="secondary">Set Undecided</StyledButton>
        </>
      )}

      <StyledLinkButton to="/admin/applications" variant="primary">
        Back to Applications
      </StyledLinkButton>
    </>
  );
};

const HeadingButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const CommonButtonStyles = css`
  &:not(:first-child) {
    margin-left: 1rem;
  }
`;

const StyledButton = styled(Button)`
  ${CommonButtonStyles};
`;

const StyledLinkButton = styled(LinkButton)`
  ${CommonButtonStyles};
  ${ButtonActiveOverrideStyles};
`;

const DeleteApplicationButton = styled(Button)`
  display: block;
  margin: 0 auto;
`;

export default ViewSubmittedApplication;
