(function () {
    'use strict';

    const ROLES = Object.freeze({
        SUPER_USER: 'SUPER_USER',
        ADMIN: 'ADMIN',
        ORGANIZER: 'ORGANIZER',
        ATTENDEE: 'ATTENDEE',
        STAFF: 'STAFF'
    });

    const STORAGE_KEYS = Object.freeze({
        DB_VERSION: 'emcp_db_version',
        USERS: 'emcp_users',
        VENUES: 'emcp_venues',
        RESOURCES: 'emcp_resources',
        EVENTS: 'emcp_events',
        REGISTRATIONS: 'emcp_registrations',
        ATTENDANCE: 'emcp_attendance',
        EVENT_STAFF: 'emcp_event_staff',
        EVENT_RESOURCES: 'emcp_event_resources',
        NOTIFICATIONS: 'emcp_notifications'
    });

    const SESSION_KEYS = Object.freeze({
        CURRENT_USER: 'emcp_current_user'
    });

    const DASHBOARD_BY_ROLE = Object.freeze({
        [ROLES.SUPER_USER]: '/super-user',
        [ROLES.ADMIN]: '/admin',
        [ROLES.ORGANIZER]: '/organizer',
        [ROLES.ATTENDEE]: '/attendee',
        [ROLES.STAFF]: '/staff'
    });

    window.EMCP = window.EMCP || {};
    window.EMCP.constants = { ROLES, STORAGE_KEYS, SESSION_KEYS, DASHBOARD_BY_ROLE };
})();
