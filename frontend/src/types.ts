// The react-select option.
export interface Option {
  value: string;
  label: string;
}

// The fields for the Hack Brooklyn application.
export interface ApplicationFormValues {
  // Part 1
  firstName: string;
  lastName: string;
  email: string;
  priorityApplicantEmail?: string;
  country: string;
  gender?: string;
  pronouns?: string;
  ethnicity?: string;
  shirtSize?: string;
  isFirstHackathon?: 'Yes' | 'No' | boolean | null;  // Converted to boolean during submission
  numberHackathonsAttended?: number | null;

  // Part 2
  school: string;
  levelOfStudy: string;
  graduationYear: number;
  major?: string;

  // Part 3
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  resumeFile?: File;

  // Part 4
  shortResponseOne?: string;
  shortResponseTwo?: string;
  shortResponseThree?: string;

  // Agreements
  acceptTocAndCoc: boolean;
  shareResumeWithSponsors?: boolean;
}
