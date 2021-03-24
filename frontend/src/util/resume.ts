import { ResumeType } from 'types';

export const getResumeType = (resumeKey: string): ResumeType => {
  if (resumeKey === null) return ResumeType.None;

  const lastFourChars = resumeKey.slice(resumeKey.length - 4).toLowerCase();
  const lastFiveChars = resumeKey.slice(resumeKey.length - 5).toLowerCase();

  if (lastFourChars === '.pdf') {
    return ResumeType.Pdf;
  } else if (lastFourChars === '.doc' || lastFiveChars === '.docx') {
    return ResumeType.Word;
  } else if (
    lastFourChars === '.jpg' ||
    lastFiveChars === '.jpeg' ||
    lastFourChars === '.png'
  ) {
    return ResumeType.Image;
  } else {
    return ResumeType.Unknown;
  }
};
