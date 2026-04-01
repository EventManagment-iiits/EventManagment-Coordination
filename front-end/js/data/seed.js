(function () {
    'use strict';

    const { STORAGE_KEYS, ROLES } = window.EMCP?.constants || {};
    const DB_VERSION = '2026-04-01-v2';

    function safeParse(raw, fallback) {
        try {
            if (!raw) return fallback;
            const val = JSON.parse(raw);
            return val ?? fallback;
        } catch {
            return fallback;
        }
    }

    function setTable(key, rows) {
        localStorage.setItem(key, JSON.stringify(rows));
    }

    function getTable(key, fallback = []) {
        return safeParse(localStorage.getItem(key), fallback);
    }

    function resetAll() {
        Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(STORAGE_KEYS.DB_VERSION, DB_VERSION);
        seed();
    }

    function ensureVersion() {
        const current = localStorage.getItem(STORAGE_KEYS.DB_VERSION);
        if (current !== DB_VERSION) {
            resetAll();
        }
    }

    function seed() {
        // Users (passwords are plain for demo only)
        const users = [
            { id: 'u1', name: 'Super User', email: 'super@emcp.io', password: 'password123', role: ROLES.SUPER_USER, status: 'Active', orgDept: 'System', createdAt: new Date().toISOString() },
            { id: 'u2', name: 'Alex Rivera', email: 'admin@emcp.io', password: 'password123', role: ROLES.ADMIN, status: 'Active', orgDept: 'Administration', createdAt: new Date().toISOString() },
            { id: 'u3', name: 'Alex Johnson', email: 'organizer@emcp.io', password: 'password123', role: ROLES.ORGANIZER, status: 'Active', orgDept: 'Student Council', createdAt: new Date().toISOString() },
            { id: 'u4', name: 'Jamie Student', email: 'attendee@emcp.io', password: 'password123', role: ROLES.ATTENDEE, status: 'Active', orgDept: 'CS Dept', createdAt: new Date().toISOString() },
            { id: 'u5', name: 'Sam Volunteer', email: 'staff@emcp.io', password: 'password123', role: ROLES.STAFF, status: 'Active', orgDept: 'Volunteer Team', createdAt: new Date().toISOString() }
        ];

        const venues = [
            { id: 'v1', venueName: 'Grand Auditorium A', location: 'Main Campus, Building 4', capacity: 850, status: 'Active' },
            { id: 'v2', venueName: 'Seminar Hall 204', location: 'East Wing, Floor 2', capacity: 120, status: 'Under Maintenance' },
            { id: 'v3', venueName: 'Executive Lounge', location: 'Tower B, Penthouse', capacity: 45, status: 'Fully Booked' }
        ];

        const resources = [
            { id: 'r1', resourceName: 'Projector', quantity: 12 },
            { id: 'r2', resourceName: 'Wireless Microphone', quantity: 20 },
            { id: 'r3', resourceName: 'Chairs', quantity: 500 }
        ];

        const today = new Date();
        const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

        const toIsoDate = (d) => d.toISOString().slice(0, 10);

        const events = [
            {
                id: 'e1',
                title: 'Tech Innovators Forum 2026',
                description: 'A day of discovery, networking, and hands-on demos.',
                imageUrl: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23e9efff'/%3E%3Ccircle cx='120' cy='120' r='90' fill='%23cbd7ff'/%3E%3Crect x='220' y='60' width='360' height='160' rx='24' fill='%23e5fff5'/%3E%3Crect x='80' y='230' width='280' height='90' rx='18' fill='%23f5ecff'/%3E%3C/svg%3E",
                eventDate: toIsoDate(d1),
                startTime: '09:00',
                endTime: '12:00',
                capacity: 249,
                organizerId: 'u3',
                venueId: 'v1'
            },
            {
                id: 'e2',
                title: 'Advanced UI/UX Workshop',
                description: 'Design systems, accessibility, and modern patterns.',
                imageUrl: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23f1f7ff'/%3E%3Crect x='60' y='70' width='220' height='140' rx='22' fill='%23d6f5ff'/%3E%3Ccircle cx='460' cy='140' r='90' fill='%23e3ddff'/%3E%3Crect x='140' y='230' width='360' height='90' rx='18' fill='%23eaf7f2'/%3E%3C/svg%3E",
                eventDate: toIsoDate(d2),
                startTime: '14:00',
                endTime: '16:30',
                capacity: 120,
                organizerId: 'u3',
                venueId: 'v2'
            }
        ];

        const registrations = [
            { id: 'reg1', userId: 'u4', eventId: 'e1', status: 'CONFIRMED', registrationDate: new Date().toISOString() }
        ];

        const attendance = [
            { id: 'a1', registrationId: 'reg1', status: 'PENDING', attendanceTime: null }
        ];

        const eventStaff = [
            { id: 'as1', eventId: 'e1', staffId: 'u5', role: 'Main Stage Setup', shiftStart: '09:00', shiftEnd: '12:00', status: 'ASSIGNED' }
        ];

        const eventResources = [
            { id: 'er1', eventId: 'e1', resourceId: 'r1', quantityUsed: 2 }
        ];

        const notifications = [
            { id: 'n1', userId: 'u5', title: 'New task assigned!', message: 'You have been added to the Tech Innovators Forum 2026 support team.', createdAt: new Date().toISOString(), type: 'info' }
        ];

        if (!localStorage.getItem(STORAGE_KEYS.USERS)) setTable(STORAGE_KEYS.USERS, users);
        if (!localStorage.getItem(STORAGE_KEYS.VENUES)) setTable(STORAGE_KEYS.VENUES, venues);
        if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) setTable(STORAGE_KEYS.RESOURCES, resources);
        if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) setTable(STORAGE_KEYS.EVENTS, events);
        if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) setTable(STORAGE_KEYS.REGISTRATIONS, registrations);
        if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) setTable(STORAGE_KEYS.ATTENDANCE, attendance);
        if (!localStorage.getItem(STORAGE_KEYS.EVENT_STAFF)) setTable(STORAGE_KEYS.EVENT_STAFF, eventStaff);
        if (!localStorage.getItem(STORAGE_KEYS.EVENT_RESOURCES)) setTable(STORAGE_KEYS.EVENT_RESOURCES, eventResources);
        if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) setTable(STORAGE_KEYS.NOTIFICATIONS, notifications);

        if (!localStorage.getItem(STORAGE_KEYS.DB_VERSION)) localStorage.setItem(STORAGE_KEYS.DB_VERSION, DB_VERSION);
    }

    // Ensure schema version + seed on first load.
    if (window.EMCP?.constants) {
        ensureVersion();
        seed();
        window.EMCP = window.EMCP || {};
        window.EMCP.seed = { resetAll, seed, version: DB_VERSION, getTable, setTable };
    }
})();
