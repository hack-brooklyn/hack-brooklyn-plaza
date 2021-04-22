import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';

import { handleError } from 'util/plazaUtils';
import { refreshAccessToken } from 'util/auth';
import {
  ApplicationDecisions,
  Breakpoints,
  ConnectionError,
  NoPermissionError,
  RootState,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';

interface ApplicationDecisionResponse {
  decision: ApplicationDecisions;
}

const ApplicationStatusSection = (): JSX.Element => {
  const history = useHistory();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const firstName = useSelector((state: RootState) => state.user.firstName);
  const windowWidth = useSelector((state: RootState) => state.app.windowWidth);

  const [decision, setDecision] = useState<ApplicationDecisions | null>(null);
  const [sectionReady, setSectionReady] = useState(false);

  useEffect(() => {
    getApplicationDecision().catch((err) => handleError(err));
  }, []);

  const getApplicationDecision = async (overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/users/applicationDecision`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: ApplicationDecisionResponse = await res.json();
      setDecision(resBody.decision);
      setSectionReady(true);
    } else if (res.status === 404) {
      // No application was submitted for the user, don't load the section
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getApplicationDecision(refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  if (sectionReady) {
    return (
      <StyledSection>
        {decision !== null && (
          <>
            {decision !== ApplicationDecisions.Rejected && (
              <ApplicationStatus>
                <span>Application Status:&nbsp;</span>
                {windowWidth < Breakpoints.Small && <br />}
                <span
                  style={{
                    color:
                      decision === ApplicationDecisions.Accepted
                        ? '#16904a'
                        : '#abb5be'
                  }}
                >
                  {decision === ApplicationDecisions.Accepted
                    ? 'Accepted'
                    : 'Under Review'}
                </span>
              </ApplicationStatus>
            )}

            <article>
              {decision === ApplicationDecisions.Accepted && (
                <AcceptedParagraph>
                  Congratulations! Welcome to Hack Brooklyn!
                </AcceptedParagraph>
              )}

              {decision === ApplicationDecisions.Rejected && (
                <article>
                  <RejectedParagraph>Hi {firstName},</RejectedParagraph>

                  <RejectedParagraph>
                    Thank you for your interest in Hack Brooklyn! This year, we
                    were fortunate to have had a diverse and talented pool of
                    applicants, and we’re thankful that so many interested
                    students want to come and change the world with us. While
                    your application was very impressive, after careful
                    consideration, we regret to inform you that we are unable to
                    offer you admission to Hack Brooklyn at this time.
                  </RejectedParagraph>

                  <RejectedParagraph>
                    We recognize that this news may come as a disappointment to
                    you. We wish it were possible for us to admit more of our
                    applicants, but in order to ensure a high quality experience
                    for everyone, we are forced to limit the total number
                    participants we can accept. Please know that our admissions
                    team reviews each and every application thoroughly and
                    carefully, and your decision was not one that we made
                    lightly.
                  </RejectedParagraph>

                  <RejectedParagraph>
                    Once again, thank you for your interest in Hack Brooklyn. We
                    wish you the best in your future endeavors, and hope to see
                    your application come through again next year.
                  </RejectedParagraph>

                  <RejectedParagraph>
                    All the best,
                    <br />
                    The Hack Brooklyn Team
                  </RejectedParagraph>
                </article>
              )}

              {decision === ApplicationDecisions.Undecided && (
                <UndecidedParagraph>
                  Thank you for applying to Hack Brooklyn! We have received your
                  application and are currently in the process of reviewing it.
                  Please check back here shortly for updates about your
                  application.
                </UndecidedParagraph>
              )}
            </article>
          </>
        )}
      </StyledSection>
    );
  } else {
    return <></>;
  }
};

export const StyledSection = styled.section`
  margin: 2rem auto;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin: 4rem auto;
  }
`;

export const ApplicationStatus = styled.h2`
  font-weight: bold;
  text-align: center;
`;

export const CommonTextStyles = css`
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
`;

export const AcceptedParagraph = styled.p`
  ${CommonTextStyles};
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
`;

export const RejectedParagraph = styled.p`
  ${CommonTextStyles};
  margin-bottom: 1rem;
`;

export const UndecidedParagraph = styled.p`
  ${CommonTextStyles};
  text-align: center;
`;

export default ApplicationStatusSection;
