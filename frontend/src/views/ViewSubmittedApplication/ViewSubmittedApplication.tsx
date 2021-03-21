import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled, { css } from 'styled-components/macro';
import Button from 'react-bootstrap/Button';

import { LinkButton } from 'components';
import { LinksSection, ProfileSection, ShortResponseSection, SummarySection } from './components';
import { ButtonActiveOverrideStyles, HeadingSection, StyledH1 } from 'commonStyles';
import { refreshAccessToken } from 'util/auth';
import { advanceApplicationIndex, exitApplicationReviewMode } from 'actions/applicationReview';
import { API_ROOT } from 'index';
import {
  ApplicationDecisions,
  ConnectionError,
  NoPermissionError,
  PageParams,
  RootState,
  SubmittedApplication,
  UnknownError
} from 'types';

interface HeadingButtonsProps {
  pageReady: boolean;
}

const ViewSubmittedApplication = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { applicationNumberParam } = useParams<PageParams>();

  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);
  const reviewModeOn = useSelector((state: RootState) => state.applicationReview.enabled);
  const appNumbers = useSelector((state: RootState) => state.applicationReview.applicationNumbers);
  const currentIndex = useSelector((state: RootState) => state.applicationReview.currentIndex);

  const [pageReady, setPageReady] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState(-1);
  const [applicationData, setApplicationData] = useState<SubmittedApplication>();
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(() => {
    // Try to parse application number from path
    if (applicationNumberParam === undefined) {
      toast.error('Please specify an application number in the URL.');
      return;
    }

    // Application number must be an integer to be sent to the backend
    const parsedApplicationNumber = parseInt(applicationNumberParam);
    if (isNaN(parsedApplicationNumber)) {
      toast.error('The application number in the URL is invalid.');
      return;
    }

    // Set and retrieve the current application data
    setApplicationNumber(parsedApplicationNumber);
    getApplicationData(parsedApplicationNumber)
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      });
  }, [applicationNumberParam]);

  const getApplicationData = async (appNumber: number, overriddenAccessToken?: string) => {
    setPageReady(false);
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
      const refreshedToken = await refreshAccessToken(history);
      await getApplicationData(appNumber, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const postUpdateApplicationDecision = async (decision: ApplicationDecisions, overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    const reqBody = {
      decision: decision
    };

    let res;
    try {
      res = await fetch(`${API_ROOT}/applications/${applicationNumber}/setDecision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reqBody)
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      return;
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await postUpdateApplicationDecision(decision, refreshedToken);
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
      return;
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await deleteApplication(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const promptDeleteApplication = async () => {
    const deleteConfirmation = prompt(
      'Are you sure you want to delete this application? This action is irreversible! Type in "DELETE" (in capital letters) to confirm.'
    );

    if (deleteConfirmation === 'DELETE') {
      try {
        setActionProcessing(true);
        await deleteApplication();
        toast.success('The application has been deleted.');
        if (reviewModeOn) {
          goToNextApplication();
        } else {
          history.push('/admin/applications');
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setActionProcessing(false);
      }
    } else {
      toast.warning('Application deletion has been cancelled.');
    }
  };

  const updateDecision = async (decision: ApplicationDecisions) => {
    try {
      setActionProcessing(true);
      await postUpdateApplicationDecision(decision);
      await getApplicationData(applicationNumber);

      if (reviewModeOn) {
        goToNextApplication();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  const goToNextApplication = () => {
    dispatch(advanceApplicationIndex());

    if (currentIndex !== null && currentIndex + 1 < appNumbers.length) {
      history.push(`/admin/applications/${appNumbers[currentIndex + 1]}`);
    } else {
      toast('You have reached the end of the undecided applications. Exiting review mode...');
      dispatch(exitApplicationReviewMode());
      history.push('/admin/applications');
    }
  };

  return (
    <>
      <HeadingSection>
        <StyledH1>View Application</StyledH1>

        <HeadingButtons>
          <RemainingApplications>
            {reviewModeOn && currentIndex !== null &&
            `${appNumbers.length - currentIndex} application${appNumbers.length - currentIndex === 1 ? '' : 's'} remaining`}
          </RemainingApplications>

          {pageReady ? (
            <>
              <StyledButton
                variant="success"
                onClick={() => updateDecision(ApplicationDecisions.Accepted)}
                disabled={actionProcessing}
              >
                {reviewModeOn ? 'Accept' : 'Set Accepted'}
              </StyledButton>

              <StyledButton
                variant="danger"
                onClick={() => updateDecision(ApplicationDecisions.Rejected)}
                disabled={actionProcessing}
              >
                {reviewModeOn ? 'Reject' : 'Set Rejected'}
              </StyledButton>

              <StyledButton
                variant="secondary"
                onClick={() => updateDecision(ApplicationDecisions.Undecided)}
                disabled={actionProcessing}
              >
                {reviewModeOn ? 'Skip' : 'Set Undecided'}
              </StyledButton>
            </>
          ) : (
            <LoadingText>
              Loading...
            </LoadingText>
          )}

          {reviewModeOn ? (
            <StyledButton
              variant="primary"
              onClick={() => {
                dispatch(exitApplicationReviewMode());
                history.push('/admin/applications');
              }}
            >
              Exit Review Mode
            </StyledButton>
          ) : (
            <StyledLinkButton
              to="/admin/applications"
              variant="primary"
            >
              Back to Applications
            </StyledLinkButton>
          )}
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
            disabled={actionProcessing}
          >
            Delete Application
          </DeleteApplicationButton>
        </>
      )}
    </>
  );
};

const HeadingButtonsText = css`
  font-size: 1.25rem;
  font-weight: bold;
`;

const RemainingApplications = styled.div`
  ${HeadingButtonsText};
  margin-right: 0.25rem;
`;

const LoadingText = styled.div`
  ${HeadingButtonsText};
  margin-left: 5.75rem;
  margin-right: 5rem;
`;

const HeadingButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
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

const DeleteApplicationButton = styled(Button)`;
  display: block;
  margin: 0 auto;
`;

export default ViewSubmittedApplication;
