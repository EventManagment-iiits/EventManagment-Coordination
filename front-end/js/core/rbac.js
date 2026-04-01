(function () {
    'use strict';

    const { ROLES } = window.EMCP.constants;

    const RESOURCES = Object.freeze({
        USERS: 'USERS',
        VENUES: 'VENUES',
        RESOURCES: 'RESOURCES',
        EVENTS: 'EVENTS',
        REGISTRATIONS: 'REGISTRATIONS',
        ATTENDANCE: 'ATTENDANCE',
        EVENT_STAFF: 'EVENT_STAFF',
        EVENT_RESOURCES: 'EVENT_RESOURCES'
    });

    const ACTIONS = Object.freeze({
        CREATE: 'CREATE',
        READ: 'READ',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE'
    });

    const POLICY = {
        [ROLES.SUPER_USER]: {
            '*': [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
        },
        [ROLES.ADMIN]: {
            [RESOURCES.VENUES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
            [RESOURCES.RESOURCES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE]
        },
        [ROLES.ORGANIZER]: {
            [RESOURCES.EVENTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
            [RESOURCES.REGISTRATIONS]: [ACTIONS.READ],
            [RESOURCES.EVENT_STAFF]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
            [RESOURCES.EVENT_RESOURCES]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
            [RESOURCES.VENUES]: [ACTIONS.READ],
            [RESOURCES.RESOURCES]: [ACTIONS.READ],
            [RESOURCES.USERS]: [ACTIONS.READ]
        },
        [ROLES.ATTENDEE]: {
            [RESOURCES.EVENTS]: [ACTIONS.READ],
            [RESOURCES.VENUES]: [ACTIONS.READ],
            [RESOURCES.REGISTRATIONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.DELETE]
        },
        [ROLES.STAFF]: {
            [RESOURCES.EVENTS]: [ACTIONS.READ],
            [RESOURCES.EVENT_STAFF]: [ACTIONS.READ, ACTIONS.UPDATE],
            [RESOURCES.ATTENDANCE]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE]
        }
    };

    function can(role, action, resource) {
        if (!role || !action || !resource) return false;
        const rolePolicy = POLICY[role];
        if (!rolePolicy) return false;
        if (rolePolicy['*'] && rolePolicy['*'].includes(action)) return true;
        const allowed = rolePolicy[resource];
        return Array.isArray(allowed) ? allowed.includes(action) : false;
    }

    window.EMCP = window.EMCP || {};
    window.EMCP.rbac = { RESOURCES, ACTIONS, can };
})();
