package org.hackbrooklyn.plaza.security;

import org.springframework.stereotype.Component;

@Component
public final class Authorities {

    public static final String ANNOUNCEMENTS_CREATE = "ANNOUNCEMENTS_CREATE";
    public static final String ANNOUNCEMENTS_READ_PUBLIC = "ANNOUNCEMENTS_READ_PUBLIC";
    public static final String ANNOUNCEMENTS_READ_PARTICIPANTS_ONLY = "ANNOUNCEMENTS_READ_PARTICIPANTS_ONLY";
    public static final String ANNOUNCEMENTS_UPDATE = "ANNOUNCEMENTS_UPDATE";
    public static final String ANNOUNCEMENTS_DELETE = "ANNOUNCEMENTS_DELETE";

    public static final String APPLICATIONS_READ = "APPLICATIONS_READ";
    public static final String APPLICATIONS_RESUME_DOWNLOAD = "APPLICATIONS_RESUME_DOWNLOAD";
    public static final String APPLICATIONS_UPDATE_DECISION = "APPLICATIONS_UPDATE_DECISION";
    public static final String APPLICATIONS_DELETE = "APPLICATIONS_DELETE";

    public static final String EVENTS_CREATE = "EVENTS_CREATE";
    public static final String EVENTS_READ = "EVENTS_READ";
    public static final String EVENTS_UPDATE = "EVENTS_UPDATE";
    public static final String EVENTS_DELETE = "EVENTS_DELETE";

    public static final String PARTICIPANT_CHECKLIST_READ = "PARTICIPANT_CHECKLIST_READ";

    public static final String SAVED_EVENTS_ADD = "SAVED_EVENTS_ADD";
    public static final String SAVED_EVENTS_READ = "SAVED_EVENTS_READ";
    public static final String SAVED_EVENTS_REMOVE = "SAVED_EVENTS_REMOVE";

    public static final String USERS_CREATE = "USERS_CREATE";
    public static final String USERS_UPDATE_ROLE = "USERS_UPDATE_ROLE";
}
