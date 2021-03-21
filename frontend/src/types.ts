import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Roles } from 'security/accessControl';
import {
  ADVANCE_APPLICATION_INDEX,
  ENTER_APPLICATION_REVIEW_MODE,
  ENTER_APPLICATION_REVIEW_MODE_FAILURE,
  ENTER_APPLICATION_REVIEW_MODE_SUCCESS,
  EXIT_APPLICATION_REVIEW_MODE,
  LOG_IN,
  LOG_OUT,
  SET_APPLICATIONS_LOADING,
  SET_JWT_ACCESS_TOKEN,
  SET_USER_DATA,
  SET_WINDOW_WIDTH
} from './constants';

// Redux Types
// Root state
export interface RootState {
  app: AppState;
  auth: AuthState;
  user: UserState;
  applicationReview: ApplicationReviewState;
  burgerMenu: { isOpen: boolean };
}

export type AppThunk<ReturnType = void> =
  ThunkAction<ReturnType, RootState, unknown, Action<string>>

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

export type AuthActionTypes =
  | LogInAction
  | LogOutAction
  | SetJwtAccessTokenAction;

// User Data
export interface UserState {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Roles | null;
}

export interface SetUserData {
  id?: number;
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

// Application Review
export interface ApplicationReviewState {
  enabled: boolean;
  loading: boolean;
  error: Error | null;
  applicationNumbers: number[];
  currentIndex: number | null;
}

interface EnterApplicationReviewModeAction {
  type: typeof ENTER_APPLICATION_REVIEW_MODE;
}

interface EnterApplicationReviewModeSuccessAction {
  type: typeof ENTER_APPLICATION_REVIEW_MODE_SUCCESS;
  payload: number[];
}

interface EnterApplicationReviewModeFailureAction {
  type: typeof ENTER_APPLICATION_REVIEW_MODE_FAILURE;
  payload: Error;
}

interface ExitApplicationReviewModeAction {
  type: typeof EXIT_APPLICATION_REVIEW_MODE;
}

interface AdvanceApplicationIndexAction {
  type: typeof ADVANCE_APPLICATION_INDEX;
}

interface SetApplicationsLoadingAction {
  type: typeof SET_APPLICATIONS_LOADING;
  payload: boolean;
}

export type ApplicationReviewActionTypes =
  EnterApplicationReviewModeAction
  | EnterApplicationReviewModeSuccessAction
  | EnterApplicationReviewModeFailureAction
  | ExitApplicationReviewModeAction
  | AdvanceApplicationIndexAction
  | SetApplicationsLoadingAction;

// General Types
// The access token returned from an authentication response
export interface AuthResponse {
  token: string;
}

// A react-select option.
export interface Option {
  value: string;
  label: string;
}

// A user's full name with their email address.
export interface UserIdentity {
  firstName: string;
  lastName: string;
  email: string;
}

// The form data for submitting an email as a request.
export interface EmailData {
  email: string;
}

// The form data for setting a new password.
export interface SetPasswordData {
  password: string;
  confirmPassword: string;
}

// The form data for activating/resetting a password with a key-password combination
export interface KeyPasswordData {
  key: string;
  password: string;
}

// Hackathon Applications
// Common required fields for the application and the response
export interface ApplicationCommon extends UserIdentity {
  // Part 1
  country: string;

  // Part 2
  school: string;
  levelOfStudy: string;
  graduationYear: number;
}

// Common properties for submitted applications
interface SubmittedApplicationCommon extends ApplicationCommon {
  applicationTimestamp: Date;
  decision: ApplicationDecisions;
}

// The application form with optional values as undefined.
export interface SubmittingApplication extends ApplicationCommon {
  // Part 1
  gender?: string;
  pronouns?: string;
  ethnicity?: string;
  shirtSize?: string;
  priorityApplicantEmail?: string;
  isFirstHackathon?: 'Yes' | 'No' | boolean | null; // Converted to boolean during submission
  numberHackathonsAttended?: number | null;

  // Part 2
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

// A submitted application in the database with optional values returned as null.
export interface SubmittedApplication extends SubmittedApplicationCommon {
  // Part 1
  gender: string | null;
  pronouns: string | null;
  ethnicity: string | null;
  shirtSize: string | null;
  isFirstHackathon: boolean | null;
  numberHackathonsAttended: number | null;

  // Part 2
  major: string | null;

  // Part 3
  githubUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  resumeKeyS3: string | null;
  // AWS resume link must be requested on demand

  // Part 4
  shortResponseOne: string | null;
  shortResponseTwo: string | null;
  shortResponseThree: string | null;
  shareResumeWithSponsors: boolean;

  // Internal fields
  priorityApplicant: boolean;
  priorityApplicantEmail: string | null;
  registeredInterest: boolean;
}

// An individual application in the manage applications table with an application number
export interface SubmittedApplicationLite extends SubmittedApplicationCommon {
  applicationNumber: number;
}

export interface GetApplicationsRequestParams {
  page?: number;
  limit?: number;
  decision?: ApplicationDecisions;
  searchQuery?: string;
}

export interface GetApplicationsResponse {
  applications: SubmittedApplicationLite[];
  pages: number;
  totalApplications: number;
  totalUndecidedApplications: number;
}

export interface GetApplicationNumbersResponse {
  applicationNumbers: number[];
}

export interface MenuAction {
  type: 'anchor' | 'link' | 'button';
  text: string;
  link?: string;
  onClick?: () => void;
  icon: string;
}

export interface PageParams {
  applicationNumberParam?: string;
}

// The possible decisions for hackathon applications.
export enum ApplicationDecisions {
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
  Undecided = 'UNDECIDED'
}

// The possible user roles for activated users.
export enum Roles {
  Admin = 'ROLE_ADMIN',
  Volunteer = 'ROLE_VOLUNTEER',
  Participant = 'ROLE_PARTICIPANT'
}

export enum ApplicationExportTypes {
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML'
}

// The Bootstrap breakpoints in pixels.
export enum Breakpoints {
  Small = 576,
  Medium = 768,
  Large = 992,
  ExtraLarge = 1200,
  ExtraExtraLarge = 1400
}

export enum ResumeType {
  Pdf = 'PDF',
  Word = 'Microsoft Word',
  Image = 'Image',
  Unknown = 'Unknown',
  None = 'N/A'
}

// Custom Errors
// Thrown when the server could not be reached.
export class ConnectionError extends Error {
  constructor() {
    super();
    this.name = 'ConnectionError';
    this.message = 'An error occurred while connecting to the server. Please check your Internet connection and try again.';
  }
}

// Thrown when any method of authentication fails.
export class AuthenticationError extends Error {
  constructor() {
    super();
    this.name = 'AuthenticationError';
    this.message = 'An error occurred while trying to authenticate your account. Please refresh the page or log out and in and try again.';
  }
}

// Thrown when the user's credentials were not accepted by the server.
export class InvalidCredentialsError extends Error {
  constructor() {
    super();
    this.name = 'InvalidCredentialsError';
    this.message = 'The email or password you entered is incorrect. Please try again.';
  }
}

// Thrown when an access token or a refresh token has expired.
export class TokenExpiredError extends Error {
  constructor() {
    super();
    this.name = 'TokenExpiredError';
    this.message = 'Your token has expired. Please log in again.';
  }
}

// Thrown when a password confirmation does not match.
export class MismatchedPasswordError extends Error {
  constructor() {
    super();
    this.name = 'MismatchedPasswordError';
    this.message = 'The passwords you entered do not match. Please try again.';
  }
}

// Thrown when a password does not meet the minimum length requirements.
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

export class InvalidPathParametersError extends Error {
  constructor(customMessage?: string) {
    super();
    this.name = 'InvalidPathParametersError';
    this.message = customMessage
      ? customMessage
      : 'There is invalid data in the URL! Please try going back to where you were before and perform the action again.';
  }
}

// Thrown when an unknown error occurs, such as an unhandled response status.
export class RoleNotFoundError extends Error {
  constructor() {
    super();
    this.name = 'RoleNotFoundError';
    this.message = 'A user role hasn\'t been assigned to you. Please contact us for further assistance.';
  }
}
