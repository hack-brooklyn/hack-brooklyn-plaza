import { LOG_IN, LOG_OUT, SET_JWT_ACCESS_TOKEN, SET_USER_DATA, SET_WINDOW_WIDTH } from './constants';

// Redux
// Root state
export interface RootState {
  app: AppState;
  auth: AuthState;
  user: UserState;
  burgerMenu: { isOpen: boolean }
}

// General app state
export interface AppState {
  windowWidth: number;
}

interface SetWindowWidthAction {
  type: typeof SET_WINDOW_WIDTH;
  payload: number;
}

export type AppActionTypes = SetWindowWidthAction;

// Auth
export interface AuthState {
  isLoggedIn: boolean;
  jwtAccessToken: string | null;
}

interface LogInAction {
  type: typeof LOG_IN;
}

interface LogOutAction {
  type: typeof LOG_OUT;
}

interface SetJwtAccessTokenAction {
  type: typeof SET_JWT_ACCESS_TOKEN;
  payload: string | null;
}

export type AuthActionTypes = LogInAction | LogOutAction | SetJwtAccessTokenAction;

// User Data
export interface UserState {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles | null;
}

export interface SetUserData {
  userId?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Roles | null;
}

interface SetUserDataAction {
  type: typeof SET_USER_DATA;
  payload: SetUserData;
}

export type UserActionTypes = SetUserDataAction;

// Common responses
export interface AuthResponse {
  token: string;
}

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

export interface MenuAction {
  type: 'anchor' | 'link' | 'button';
  text: string;
  link?: string;
  onClick?: () => void;
  icon: string;
}

export enum Roles {
  Admin = 'ROLE_ADMIN',
  Volunteer = 'ROLE_VOLUNTEER',
  Participant = 'ROLE_PARTICIPANT'
}

export enum Breakpoints {
  Small = 576,
  Medium = 768,
  Large = 992,
  ExtraLarge = 1200,
  ExtraExtraLarge = 1400
}
