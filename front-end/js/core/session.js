(function () {
    'use strict';

     //Ye file login session manage 
     // karti hai — user
     //  ka data sessionStorage me rakhti
     //  hai aur dashboard 
     // redirect handle karti hai.

    const { ROLES, SESSION_KEYS, DASHBOARD_BY_ROLE } = window.EMCP.constants;

    function getCurrentUser() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEYS.CURRENT_USER);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function setCurrentUser(user) {
        sessionStorage.setItem(SESSION_KEYS.CURRENT_USER, JSON.stringify(user));
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEYS.CURRENT_USER);
    }

    function logout(redirectTo = '/login') {
        clearSession();
        window.location.href = redirectTo;
    }

    function getDashboardForRole(role) {
        return DASHBOARD_BY_ROLE[role] || '/login';
    }

    function redirectToDashboard(user) {
        const target = getDashboardForRole(user.role);
        window.location.href = target;
    }

    function normalizeRole(role) {
        const values = Object.values(ROLES);
        return values.includes(role) ? role : null;
    }

    window.EMCP = window.EMCP || {};
    window.EMCP.session = {
        getCurrentUser,
        setCurrentUser,
        logout,
        getDashboardForRole,
        redirectToDashboard,
        normalizeRole
    };
})();
