(function () {
    'use strict';

    const { ROLES } = window.EMCP.constants;

    function requireAuth(allowedRoles) {
        const user = window.EMCP.session.getCurrentUser();
        if (!user) {
            window.location.href = '/login?msg=' + encodeURIComponent('Please log in to continue.');
            return null;
        }

        const role = window.EMCP.session.normalizeRole(user.role);
        if (!role) {
            window.EMCP.session.logout('/login?msg=' + encodeURIComponent('Invalid session. Please log in again.'));
            return null;
        }

        if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            window.location.href = window.EMCP.session.getDashboardForRole
                ? window.EMCP.session.getDashboardForRole(role)
                : '/login?msg=' + encodeURIComponent('Access denied.');
            return null;
        }

        return user;
    }

    function enforceRoleOrRedirect(allowedRoles) {
        const user = window.EMCP.session.getCurrentUser();
        if (!user) {
            window.location.href = '/login?msg=' + encodeURIComponent('Please log in to continue.');
            return null;
        }

        const role = window.EMCP.session.normalizeRole(user.role);
        if (!role) {
            window.EMCP.session.logout('/login?msg=' + encodeURIComponent('Invalid session. Please log in again.'));
            return null;
        }

        if (!allowedRoles.includes(role)) {
            const dash = window.EMCP.constants.DASHBOARD_BY_ROLE[role] || '/login';
            window.location.href = dash + '?msg=' + encodeURIComponent('Access denied.');
            return null;
        }

        return { ...user, role };
    }

    function bindLogout() {
        const btn = document.getElementById('logout-btn');
        if (!btn) return;
        btn.addEventListener('click', () => window.EMCP.session.logout());
    }

    function initSidebarNav(modulesSelector = '.module') {
        const navItems = Array.from(document.querySelectorAll('.nav-item[data-module]'));
        const modules = Array.from(document.querySelectorAll(modulesSelector));
        if (navItems.length === 0 || modules.length === 0) return;

        function setActive(moduleName) {
            navItems.forEach((btn) => btn.classList.toggle('active', btn.dataset.module === moduleName));
            modules.forEach((m) => m.classList.toggle('hidden', m.dataset.module !== moduleName));

            const title = document.getElementById('page-title');
            if (title) {
                const label = navItems.find((b) => b.dataset.module === moduleName)?.textContent?.trim();
                if (label) title.textContent = label;
            }
        }

        navItems.forEach((btn) => {
            btn.addEventListener('click', () => setActive(btn.dataset.module));
        });

        const initial = navItems.find((b) => b.classList.contains('active'))?.dataset?.module || navItems[0].dataset.module;
        setActive(initial);

        document.querySelectorAll('[data-nav-module]').forEach((el) => {
            el.addEventListener('click', () => setActive(el.getAttribute('data-nav-module')));
        });

        return { setActive };
    }

    window.EMCP = window.EMCP || {};
    window.EMCP.guard = {
        requireAuth,
        enforceRoleOrRedirect,
        bindLogout,
        initSidebarNav
    };
})();
