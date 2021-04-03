import { Option } from 'types';

export const genderOptions: Option[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other (Type gender here and select "Create")' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

export const pronounOptions: Option[] = [
  { value: 'He/Him/His', label: 'He/Him/His' },
  { value: 'She/Her/Hers', label: 'She/Her/Hers' },
  { value: 'They/Them/Theirs', label: 'They/Them/Theirs' },
  { value: 'Other', label: 'Other (Type pronouns here and select "Create")' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

export const ethnicityOptions: Option[] = [
  { value: 'American Indian or Alaska Native', label: 'American Indian or Alaska Native' },
  { value: 'Asian', label: 'Asian' },
  { value: 'Black or African American', label: 'Black or African American' },
  { value: 'Hispanic or Latino', label: 'Hispanic or Latino' },
  { value: 'Native Hawaiian or Other Pacific Islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'White', label: 'White' },
  { value: 'Other', label: 'Other (Type ethnicity here and select "Create")' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

export const shirtSizeOptions: Option[] = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'Other', label: 'Other (Type shirt size here and select "Create")' }
];

export const referrerOptions: Option[] = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Discord', label: 'Discord' },
  { value: 'Slack', label: 'Slack' },
  { value: 'From a Friend', label: 'From a Friend' },
  { value: 'Word of Mouth', label: 'Word of Mouth' },
  { value: 'In-class Announcement', label: 'In-class Announcement' },
  { value: 'BC CIS Department', label: 'BC CIS Department' },
  { value: 'BC Computer Science Club', label: 'BC Computer Science Club' },
  { value: 'BC Women in Computer Science Club', label: 'BC Women in Computer Science Club' },
  { value: 'Other', label: 'Other (Type referral source here and select "Create")' }
];

export const levelsOfStudyOptions: Option[] = [
  { value: 'Freshman/1st Year', label: 'Freshman/1st Year' },
  { value: 'Sophomore/2nd Year', label: 'Sophomore/2nd Year' },
  { value: 'Junior/3rd Year', label: 'Junior/3rd Year' },
  { value: 'Senior/4th Year', label: 'Senior/4th Year' },
  { value: 'Other', label: 'Other (Type here and select "Create")' }
];
