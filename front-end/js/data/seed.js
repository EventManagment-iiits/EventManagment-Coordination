(function () {
    'use strict';

    // Seeding is now handled by the NestJS backend (SeedService).
    // This file is kept for compatibility but does nothing.

    window.EMCP = window.EMCP || {};
    window.EMCP.seed = {
        resetAll: function () { console.log('Seed: data is managed by the backend.'); },
        seed: function () { /* no-op */ },
        version: 'backend-managed'
    };
})();
