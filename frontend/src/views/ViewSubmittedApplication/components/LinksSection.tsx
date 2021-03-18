import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';

import { getResumeType } from 'util/resume';
import { ResumeType, SubmittedApplication } from 'types';

import githubIcon from 'assets/icons/logos/github.svg';
import githubMissingIcon from 'assets/icons/logos/github-missing.svg';
import linkedinIcon from 'assets/icons/logos/linkedin.svg';
import linkedinMissingIcon from 'assets/icons/logos/linkedin-missing.svg';
import webIcon from 'assets/icons/web.svg';
import webMissingIcon from 'assets/icons/web-missing.svg';
import fileMissingIcon from 'assets/icons/files/file-missing.svg';
import filePdfIcon from 'assets/icons/files/file-pdf.svg';
import fileWordIcon from 'assets/icons/files/file-word.svg';
import fileImageIcon from 'assets/icons/files/file-image.svg';
import fileGenericIcon from 'assets/icons/files/file-generic.svg';

interface LinksSectionProps {
  applicationData: SubmittedApplication;
  applicationNumber: number;
}

interface SubmittedLinkProps {
  icon: string;
  missingIcon: string;
  link: string | null;
  type: string;
}

const LinksSection = (props: LinksSectionProps): JSX.Element => {
  const { applicationData, applicationNumber } = props;

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
    <StyledSection>
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
    </StyledSection>
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

const StyledSection = styled.section`
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

export default LinksSection;
