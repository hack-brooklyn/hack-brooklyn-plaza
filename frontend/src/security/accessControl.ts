import { AccessControl } from 'accesscontrol';

export enum Roles {
  Admin = 'ROLE_ADMIN',
  Volunteer = 'ROLE_VOLUNTEER',
  Participant = 'ROLE_PARTICIPANT',
  Applicant = 'ROLE_APPLICANT',
  None = 'ROLE_NONE'
}

export enum Resources {
  Announcements = 'ANNOUNCEMENTS',
  Applications = 'APPLICATIONS',
  Events = 'EVENTS',
  MentorMatcher = 'MENTOR_MATCHER',
  SavedEvents = 'SAVED_EVENTS',
  ScheduleBuilder = 'SCHEDULE_BUILDER',
  TeamFormation = 'TEAM_FORMATION',
  Users = 'USERS'
}

export enum AnnouncementsAttributes {
  Public = 'PUBLIC',
  ParticipantsOnly = 'PARTICIPANTS_ONLY'
}

export enum ApplicationsAttributes {
  Decisions = 'DECISIONS'
}

export enum UsersAttributes {
  Roles = 'ROLES'
}

const grants = {
  [Roles.Admin]: {
    [Resources.Announcements]: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*']
    },
    [Resources.Applications]: {
      'read:any': ['*'],
      'update:any': [ApplicationsAttributes.Decisions],
      'delete:any': ['*']
    },
    [Resources.Events]: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*']
    },
    [Resources.MentorMatcher]: {
      'read:any': ['*']
    },
    [Resources.SavedEvents]: {
      'create:own': ['*'],
      'read:own': ['*'],
      'delete:own': ['*']
    },
    [Resources.ScheduleBuilder]: {
      'read:any': ['*']
    },
    [Resources.TeamFormation]: {
      'read:any': ['*']
    },
    [Resources.Users]: {
      'create:any': ['*'],
      'update:any': [UsersAttributes.Roles]
    }
  },
  [Roles.Volunteer]: {
    $extend: [Roles.Participant]
  },
  [Roles.Participant]: {
    $extend: [Roles.Applicant],
    [Resources.Announcements]: {
      'read:any': [AnnouncementsAttributes.ParticipantsOnly]
    },
    [Resources.Events]: {
      'read:any': ['*']
    },
    [Resources.SavedEvents]: {
      'create:any': ['*'],
      'read:any': ['*'],
      'delete:any': ['*']
    }
  },
  [Roles.Applicant]: {
    [Resources.Announcements]: {
      'read:any': [AnnouncementsAttributes.Public]
    }
  },
  [Roles.None]: {}
};

const ac = new AccessControl(grants).lock();

export default ac;
