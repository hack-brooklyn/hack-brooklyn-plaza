import { AccessControl } from 'accesscontrol';

export enum Roles {
  Admin = 'ROLE_ADMIN',
  Volunteer = 'ROLE_VOLUNTEER',
  Participant = 'ROLE_PARTICIPANT',
  Applicant = 'ROLE_APPLICANT',
  None = 'ROLE_NONE'
}

export enum Resources {
  Applications,
  Users,
  Announcements,
  Events,
  SavedEvents
}

export enum AnnouncementsAttributes {
  Public,
  ParticipantsOnly
}

export enum ApplicationsAttributes {
  Decisions
}

export enum UsersAttributes {
  Roles
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
    [Resources.SavedEvents]: {
      'create:any': ['*'],
      'read:any': ['*'],
      'delete:any': ['*']
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
  }
};

const ac = new AccessControl(grants).lock();

export default ac;
