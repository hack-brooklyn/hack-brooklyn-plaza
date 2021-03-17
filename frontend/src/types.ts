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

// Admin
export interface AdminState {
  applicationReviewModeOn: boolean;
}

interface EnterApplicationReviewModeAction {
  type: typeof ENTER_APPLICATION_REVIEW_MODE;
}

interface ExitApplicationReviewModeAction {
  type: typeof EXIT_APPLICATION_REVIEW_MODE;
}

export type AdminActionTypes =
  | EnterApplicationReviewModeAction
  | ExitApplicationReviewModeAction;

// General Types
// The access token returned from an authentication response
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

export interface SetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface EmailData {
  email: string;
}

export interface KeyPasswordData {
  key: string;
  password: string;
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

/**
 * Thrown when the server could not be reached.
 */
export class ConnectionError extends Error {
  constructor() {
    super();
    this.name = 'ConnectionError';
    this.message = 'An error occurred while connecting to the server. Please check your Internet connection and try again.';
  }
}

/**
 * Thrown when any method of authentication fails.
 */
export class AuthenticationError extends Error {
  constructor() {
    super();
    this.name = 'AuthenticationError';
    this.message = 'An error occurred while trying to authenticate your account. Please refresh the page or log out and in and try again.';
  }
}

/**
 * Thrown when the user's credentials were not accepted by the server.
 */
export class InvalidCredentialsError extends Error {
  constructor() {
    super();
    this.name = 'InvalidCredentialsError';
    this.message = 'The email or password you entered is incorrect. Please try again.';
  }
}

/**
 * Thrown when an access token or a refresh token has expired.
 */
export class TokenExpiredError extends Error {
  constructor() {
    super();
    this.name = 'TokenExpiredError';
    this.message = 'Your token has expired. Please log in again.';
  }
}

export class MismatchedPasswordError extends Error {
  constructor() {
    super();
    this.name = 'MismatchedPasswordError';
    this.message = 'Passwords do not match. Please try again.';
  }
}

export class PasswordTooShortError extends Error {
  constructor() {
    super();
    this.name = 'PasswordTooShortError';
    this.message = 'The password you entered is too short. Please choose a password that is 12 characters or longer.';
  }
}

// Thrown when a user tries to access an endpoint that they have no permission for.
export class NoPermissionError extends Error {
  constructor() {
    super();
    this.name = 'NoPermissionError';
    this.message = 'You do not have access to this part of Hack Brooklyn Plaza.';
  }
}

// Thrown when an unknown error occurs, such as an unhandled response status.
export class UnknownError extends Error {
  constructor() {
    super();
    this.name = 'UnknownError';
    this.message =
      'Something went wrong! Please refresh the page and try again.';
  }
}
