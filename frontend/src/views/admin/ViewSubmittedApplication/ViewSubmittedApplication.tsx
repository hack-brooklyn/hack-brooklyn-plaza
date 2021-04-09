import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';

import { LinkButton } from 'components';
import {
  LinksSection,
  ProfileSection,
  ShortResponseSection,
  SummarySection
} from './components';
import {
  ButtonActiveOverrideStyles,
  HeadingSection,
  StyledH1
} from 'common/styles/commonStyles';
import {
  advanceApplicationIndex,
  exitApplicationReviewMode
} from 'actions/applicationReview';
import { acCan, refreshAccessToken } from 'util/auth';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { checkApplicationPageParams } from 'util/applications';
import { Resources } from 'security/accessControl';
import {
  ApplicationDecisions,
  Breakpoints,
  ConnectionError,
  NoPermissionError,
  PageParams,
  RootState,
  SubmittedApplication,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

const ViewSubmittedApplication = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { applicationNumberParam } = useParams<PageParams>();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const userRole = useSelector((state: RootState) => state.user.role);
  const reviewModeOn = useSelector(
    (state: RootState) => state.applicationReview.enabled
  );
  const appNumbers = useSelector(
    (state: RootState) => state.applicationReview.applicationNumbers
  );
  const currentIndex = useSelector(
    (state: RootState) => state.applicationReview.currentIndex
  );

  const [pageReady, setPageReady] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState(-1);
  const [
    applicationData,
    setApplicationData
  ] = useState<SubmittedApplication>();
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(() => {
    try {
      const permission = acCan(userRole).readAny(Resources.Applications);
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
      return;
    }

    let parsedApplicationNumber: number;
    try {
      parsedApplicationNumber = checkApplicationPageParams(
        applicationNumberParam
      );
    } catch (err) {
      handleError(err);
      return;
    }

    setApplicationNumber(parsedApplicationNumber);
    getApplicationData(parsedApplicationNumber).catch((err) =>
      handleError(err)
    );
  }, [applicationNumberParam]);

  const getApplicationData = async (
    appNumber: number,
    overriddenAccessToken?: string
  ) => {
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

  const postUpdateApplicationDecision = async (
    decision: ApplicationDecisions,
    overriddenAccessToken?: string
  ) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    const reqBody = {
      decision: decision
    };

    let res;
    try {
      res = await fetch(
        `${API_ROOT}/applications/${applicationNumber}/setDecision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(reqBody)
        }
      );
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
        handleError(err);
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
      handleError(err);
    } finally {
      setActionProcessing(false);
    }
  };

  const goToNextApplication = () => {
    dispatch(advanceApplicationIndex());

    if (currentIndex !== null && currentIndex + 1 < appNumbers.length) {
      history.push(`/admin/applications/${appNumbers[currentIndex + 1]}`);
    } else {
      toast(
        'You have reached the end of the undecided applications. Exiting review mode...'
      );
      dispatch(exitApplicationReviewMode());
      history.push('/admin/applications');
    }
  };

  return (
    <>
      <HeadingSection>
        <StyledH1>View Application</StyledH1>

        <HeadingActions>
          <RemainingApplications>
            {reviewModeOn &&
              currentIndex !== null &&
              `${appNumbers.length - currentIndex} Remaining`}
          </RemainingApplications>

          <HeadingButtons>
            <DecisionButtons>
              {pageReady ? (
                <>
                  <StyledButton
                    variant="success"
                    onClick={() =>
                      updateDecision(ApplicationDecisions.Accepted)
                    }
                    disabled={actionProcessing}
                  >
                    Accept
                  </StyledButton>

                  <StyledButton
                    variant="danger"
                    onClick={() =>
                      updateDecision(ApplicationDecisions.Rejected)
                    }
                    disabled={actionProcessing}
                  >
                    Reject
                  </StyledButton>

                  <StyledButton
                    variant="secondary"
                    onClick={() =>
                      updateDecision(ApplicationDecisions.Undecided)
                    }
                    disabled={actionProcessing}
                  >
                    {reviewModeOn ? 'Skip' : 'Undecided'}
                  </StyledButton>
                </>
              ) : (
                <LoadingText>Loading...</LoadingText>
              )}
            </DecisionButtons>

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
              <StyledLinkButton to="/admin/applications" variant="primary">
                Back to Applications
              </StyledLinkButton>
            )}
          </HeadingButtons>
        </HeadingActions>
      </HeadingSection>

      {pageReady && applicationData && (
        <>
          <SummarySection
            applicationData={applicationData}
            applicationNumber={applicationNumber}
          />

          <ProfileSection applicationData={applicationData} />

          <ShortResponseSection applicationData={applicationData} />

          <LinksSection
            applicationData={applicationData}
            applicationNumber={applicationNumber}
          />

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

const CommonButtonStyles = css`
  margin-bottom: 0.75rem;
  width: 100%;


  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 0;
    width: auto;

    &:not(:last-child) {
      margin-right: 1rem;
    }
  }

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-right: 1rem;
  }
`;

const HeadingActions = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    flex-direction: row;
    margin-top: 0;
  }
`;

const HeadingButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    flex-direction: row;
    justify-content: center;
    margin-top: 0;
  }
`;

const DecisionButtons = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
    flex-direction: row;
    margin-bottom: 1rem;
  }

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 0;
  }
`;

const RemainingApplications = styled.div`
  ${HeadingButtonsText};
  margin-bottom: 1rem;
  align-self: center;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    display: block;
    margin-bottom: 0;
    margin-right: 1rem;
  }
`;

const LoadingText = styled.div`
  ${HeadingButtonsText};
  margin-left: 5.75rem;
  margin-right: 5rem;
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
