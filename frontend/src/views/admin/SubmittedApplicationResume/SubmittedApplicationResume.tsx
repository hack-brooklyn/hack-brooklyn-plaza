import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components/macro';

import { LinkButton } from 'components';
import { ButtonActiveOverrideStyles } from 'common/styles/commonStyles';
import { acCan, refreshAccessToken } from 'util/auth';
import { checkApplicationPageParams } from 'util/applications';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { Resources } from 'security/accessControl';
import { Breakpoints, ConnectionError, NoPermissionError, PageParams, RootState, UnknownError } from 'types';
import { API_ROOT } from 'index';

interface GenerateResumeLinkResponse {
  link: string;
}

const SubmittedApplicationResume = (): JSX.Element => {
  const history = useHistory();
  const { applicationNumberParam } = useParams<PageParams>();

  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);
  const userRole = useSelector((state: RootState) => state.user.role);

  const [applicationNumber, setApplicationNumber] = useState(-1);
  const [resumeLink, setResumeLink] = useState('');
  const [downloadReady, setDownloadReady] = useState(false);

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
      parsedApplicationNumber = checkApplicationPageParams(applicationNumberParam);
    } catch (err) {
      handleError(err);
      return;
    }

    setApplicationNumber(parsedApplicationNumber);
    getResumeLink(parsedApplicationNumber)
      .catch(err => handleError(err));
  }, []);

  const getResumeLink = async (appNumber: number, overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/applications/${appNumber}/generateResumeLink`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: GenerateResumeLinkResponse = await res.json();

      setResumeLink(resBody.link);
      setDownloadReady(true);

      window.location.replace(resBody.link);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getResumeLink(appNumber, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  return (
    <PageContainer>
      {downloadReady ? (
        <>
          <StyledH1>Downloading resume...</StyledH1>
          <ResumeLinkAnchor
            href={resumeLink}
            rel="noopener noreferrer"
          >
            Click here if the download does not start automatically.
          </ResumeLinkAnchor>
        </>
      ) : (
        <>
          <StyledH1>Generating resume download link...</StyledH1>
          <StyledH2>Taking too long? Try refreshing the page.</StyledH2>
        </>
      )}

      <BackToApplicationButton
        to={`/admin/applications/${applicationNumber}`}
        variant="primary"
      >
        Return to Application
      </BackToApplicationButton>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledH1 = styled.h1`
  margin-top: 2rem;
  text-align: center;
`;

const StyledH2 = styled.h2`
  font-size: 1.25rem;
  text-align: center;
  margin-top: 0.5rem;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    font-size: 1.75rem;
  }
`;

const ResumeLinkAnchor = styled.a`
  display: block;
  font-size: 1.5rem;
  text-decoration: none;
`;

const BackToApplicationButton = styled(LinkButton)`
  ${ButtonActiveOverrideStyles};
  margin-top: 2rem;
`;

export default SubmittedApplicationResume;
