import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled, { css } from 'styled-components/macro';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { API_ROOT } from 'index';
import {
  ConnectionError,
  InvalidPathParametersError,
  NoPermissionError,
  ResumeType,
  RootState,
  SubmittedApplication,
  UnknownError
} from 'types';
import { refreshAccessToken } from 'util/auth';
import { ButtonActiveOverrideStyles, HeadingSection, StyledH1 } from 'commonStyles';
import priorityApplicantIcon from 'assets/icons/application-labels/priority.svg';
import generalPriorityApplicantIcon from 'assets/icons/application-labels/general-priority.svg';
import githubIcon from 'assets/icons/logos/github.svg';
import githubMissingIcon from 'assets/icons/logos/github-missing.svg';
import linkedinIcon from 'assets/icons/logos/linkedin.svg';
import linkedinMissingIcon from 'assets/icons/logos/linkedin-missing.svg';
import webIcon from 'assets/icons/web.svg';
import webMissingIcon from 'assets/icons/web-missing.svg';
import fileGenericIcon from 'assets/icons/files/file-generic.svg';
import filePdfIcon from 'assets/icons/files/file-pdf.svg';
import fileWordIcon from 'assets/icons/files/file-word.svg';
import fileImageIcon from 'assets/icons/files/file-image.svg';
import fileMissingIcon from 'assets/icons/files/file-missing.svg';
import { getResumeType } from 'util/resume';
import { LinkButton } from 'components';

interface PageParams {
  applicationNumberParam?: string;
}

interface ApplicantLabelProps {
  icon: string;
  labelText: string;
}

interface ApplicantProfileFieldProps {
  name: string;
  value: string | number | boolean | null;
}

interface ShortResponseQuestionProps {
  question: string;
  response: string | null;
}

interface SubmittedLinkProps {
  icon: string;
  missingIcon: string;
  link: string | null;
  type: string;
}

const ViewSubmittedApplication = (): JSX.Element => {
  const history = useHistory();
  const { applicationNumberParam } = useParams<PageParams>();

  const accessToken = useSelector(
    (state: RootState) => state.auth.jwtAccessToken
  );
  const reviewModeOn = useSelector(
    (state: RootState) => state.admin.applicationReviewModeOn
  );
  const [pageReady, setPageReady] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState(-1);
  const [
    applicationData,
    setApplicationData
  ] = useState<SubmittedApplication>();

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

  const getApplicationData = async (
    appNumber: number,
    overriddenAccessToken?: string
  ) => {
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

  const getResumeIcon = () => {
    if (applicationData?.resumeKeyS3) {
      const uploadedResumeType = getResumeType(applicationData.resumeKeyS3);
      switch (uploadedResumeType) {
        case ResumeType.None:
          return fileMissingIcon;
        case ResumeType.Pdf:
          return filePdfIcon;
        case ResumeType.Word:
          return fileWordIcon;
        case ResumeType.Image:
          return fileImageIcon;
        default:
          return fileGenericIcon;
      }
    } else {
      return fileMissingIcon;
    }
  };

  return (
    <>
      <HeadingSection>
        <StyledH1>View Application</StyledH1>

        {reviewModeOn ? (
          <ReviewModeButtons>
            {pageReady && (
              <>
                <StyledButton variant="success">Accept</StyledButton>
                <StyledButton variant="danger">Reject</StyledButton>
                <StyledButton variant="secondary">Decide Later</StyledButton>
              </>
            )}
            <StyledButton variant="primary">Exit Review Mode</StyledButton>
          </ReviewModeButtons>
        ) : (
          <div>
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
          </div>
        )}
      </HeadingSection>

      {pageReady && applicationData && (
        <>
          <SummarySection>
            <ApplicantNameAndEmail>
              <ApplicantName>
                {applicationData.firstName} {applicationData.lastName}
              </ApplicantName>
              <ApplicantEmailLink href={`mailto:${applicationData.email}`}>
                {applicationData.email}
              </ApplicantEmailLink>
            </ApplicantNameAndEmail>

            <ApplicationNumber>
              Application #{applicationNumberParam}
            </ApplicationNumber>
            <ApplicantLabelContainer>
              {applicationData.priorityApplicant && (
                <ApplicantLabel
                  icon={priorityApplicantIcon}
                  labelText="Priority Applicant"
                />
              )}

              {applicationData.registeredInterest && (
                <ApplicantLabel
                  icon={generalPriorityApplicantIcon}
                  labelText="General Priority Applicant"
                />
              )}
            </ApplicantLabelContainer>
          </SummarySection>

          <ProfileSection>
            <Row>
              <Col md={6}>
                <ApplicantProfileField
                  name="Country"
                  value={applicationData.country}
                />
                <ApplicantProfileField
                  name="Gender"
                  value={applicationData.gender}
                />
                <ApplicantProfileField
                  name="Pronouns"
                  value={applicationData.pronouns}
                />
                <ApplicantProfileField
                  name="Ethnicity"
                  value={applicationData.ethnicity}
                />
                <ApplicantProfileField
                  name="Shirt Size"
                  value={applicationData.shirtSize}
                />
                <ApplicantProfileField
                  name="First Hackathon"
                  value={applicationData.isFirstHackathon ? 'Yes' : 'No'}
                />
                {!applicationData.isFirstHackathon && (
                  <ApplicantProfileField
                    name="Hackathons Attended"
                    value={applicationData.numberHackathonsAttended}
                  />
                )}
              </Col>
              <Col md={6}>
                <ApplicantProfileField
                  name="School"
                  value={applicationData.school}
                />
                <ApplicantProfileField
                  name="Level of Study"
                  value={applicationData.levelOfStudy}
                />
                <ApplicantProfileField
                  name="Graduation Year"
                  value={applicationData.graduationYear}
                />
                <ApplicantProfileField
                  name="Major"
                  value={applicationData.major}
                />
              </Col>
            </Row>
          </ProfileSection>

          <ShortResponseSection>
            <ShortResponse
              question="What do you hope to gain by coming to Hack Brooklyn?"
              response={applicationData.shortResponseOne}
            />
            <ShortResponse
              question="If you could build anything to change the world for the better, what would you make?"
              response={applicationData.shortResponseTwo}
            />
            <ShortResponse
              question="Is there anything else you want to let us know about?"
              response={applicationData.shortResponseThree}
            />
          </ShortResponseSection>

          <LinksSection>
            <SubmittedLinksHeading>Links:</SubmittedLinksHeading>

            <SubmittedLink
              icon={githubIcon}
              missingIcon={githubMissingIcon}
              link={applicationData.githubUrl}
              type="GitHub"
            />

            <SubmittedLink
              icon={linkedinIcon}
              missingIcon={linkedinMissingIcon}
              link={applicationData.linkedinUrl}
              type="LinkedIn"
            />

            <SubmittedLink
              icon={webIcon}
              missingIcon={webMissingIcon}
              link={applicationData.websiteUrl}
              type="Website"
            />

            {applicationData.resumeKeyS3 ? (
              <ResumeLinkContents
                to={`/admin/applications/${applicationNumber}/resume`}
              >
                <img src={getResumeIcon()} alt="Download resume" />
                <SubmittedLinkUrl>
                  Download Resume ({getResumeType(applicationData.resumeKeyS3)})
                </SubmittedLinkUrl>
              </ResumeLinkContents>
            ) : (
              <SubmittedLinkNotProvided>
                <img src={fileMissingIcon} alt={'Resume not uploaded'} />
                <SubmittedLinkUrl>Resume Not Uploaded</SubmittedLinkUrl>
              </SubmittedLinkNotProvided>
            )}
          </LinksSection>

          <DeleteApplicationButton
            variant="outline-danger"
            size="sm"
            onClick={() => {
              const deleteConfirmation = prompt(
                'Are you sure you want to delete this application? This action is irreversible! Type in "DELETE" (in capital letters) to confirm.'
              );

              if (deleteConfirmation === 'DELETE') {
                // Delete the application
                deleteApplication();
              } else {
                toast.warning('Application deletion has been cancelled.');
              }
            }}
          >
            Delete Application
          </DeleteApplicationButton>
        </>
      )}
    </>
  );
};
const ApplicantLabel = (props: ApplicantLabelProps): JSX.Element => {
  const { icon, labelText } = props;

  return (
    <ApplicantLabelContents>
      <ApplicantLabelIcon src={icon} alt={labelText} />
      <ApplicantLabelText>{labelText}</ApplicantLabelText>
    </ApplicantLabelContents>
  );
};

const ApplicantProfileField = (
  props: ApplicantProfileFieldProps
): JSX.Element => {
  const { name, value } = props;

  return (
    <ApplicantProfileFieldContents>
      <strong>{name}:</strong> {value !== null ? value : 'Not Provided'}
    </ApplicantProfileFieldContents>
  );
};

const ShortResponse = (props: ShortResponseQuestionProps): JSX.Element => {
  const { question, response } = props;

  return (
    <ShortResponseContent>
      <ShortResponseQuestion>{question}</ShortResponseQuestion>
      {response && response.trim() !== '' ? (
        <ShortResponseResponse>{response}</ShortResponseResponse>
      ) : (
        <ShortResponseResponseBlank>
          No response provided.
        </ShortResponseResponseBlank>
      )}
    </ShortResponseContent>
  );
};

const SubmittedLink = (props: SubmittedLinkProps) => {
  const { icon, missingIcon, link, type } = props;

  if (link) {
    return (
      <SubmittedLinkContents
        href={link}
        rel="noopener noreferrer"
        target="_blank"
      >
        <img src={icon} alt={`Link to ${type}`} />
        <SubmittedLinkUrl>
          {link.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')}
        </SubmittedLinkUrl>
      </SubmittedLinkContents>
    );
  } else {
    return (
      <SubmittedLinkNotProvided>
        <img src={missingIcon} alt={`${type} not provided`} />
        <SubmittedLinkUrl>{type} Not Provided</SubmittedLinkUrl>
      </SubmittedLinkNotProvided>
    );
  }
};

const ReviewModeButtons = styled.div`
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

// Summary Section
const SummarySection = styled.section`
  margin-bottom: 1rem;
`;

const ApplicantNameAndEmail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

const ApplicantName = styled.h2`
  font-size: 3rem;
  text-align: center;
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ApplicantEmailLink = styled.a`
  font-size: 1.5rem;
  font-weight: normal;
  text-decoration: none;
`;

const ApplicationNumber = styled.h3`
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ApplicantLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ApplicantLabelContents = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 0.75rem;
`;

const ApplicantLabelIcon = styled.img`
  width: 1.75rem;
  height: 1.75rem;
`;

const ApplicantLabelText = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  margin-left: 0.5rem;
`;

// Profile Section
const ProfileSection = styled.section`
  max-width: 800px;
  margin: 0 auto 2rem;
  border: 3px solid lightgray;
  border-radius: 1rem;
  padding: 1rem 1rem 1rem 1.25rem;
`;

const ApplicantProfileFieldContents = styled.div`
  font-size: 1.25rem;
  margin-top: 0.125rem;
  margin-bottom: 0.125rem;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// Short Response Section
const ShortResponseSection = styled.section`
  margin: 0 auto 3rem;
  max-width: 900px;
`;

const ShortResponseContent = styled.div`
  margin-bottom: 2rem;
`;

const ShortResponseQuestion = styled.h3`
  font-weight: bold;
`;

const ShortResponseResponse = styled.p`
  font-size: 1.25rem;
`;

const ShortResponseResponseBlank = styled(ShortResponseResponse)`
  color: #abb5be;
`;

// Links Section
const LinksSection = styled.section`
  margin: 0 auto 5rem;
`;

const SubmittedLinksHeading = styled.h3`
  text-align: center;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const SubmittedLinkCommon = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 1.25rem;
`;

const SubmittedLinkContents = styled.a`
  ${SubmittedLinkCommon};
  text-decoration: none;
`;

const ResumeLinkContents = styled(Link)`
  ${SubmittedLinkCommon};
  text-decoration: none;
`;

const SubmittedLinkNotProvided = styled.div`
  ${SubmittedLinkCommon};
  color: #abb5be;
  cursor: not-allowed;
`;

const SubmittedLinkUrl = styled.div`
  margin-left: 0.5rem;
  font-size: 1.25rem;
`;

const DeleteApplicationButton = styled(Button)`
  display: block;
  margin: 0 auto;
`;

export default ViewSubmittedApplication;
