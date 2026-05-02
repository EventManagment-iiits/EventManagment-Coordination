(function () {
    'use strict';

    // ============================================================
    // repo.js — API Client Layer
    // Replaces localStorage with fetch() calls to NestJS backend.
    // All functions are async and return Promises.
    // ============================================================

    const API_BASE = 'http://localhost:3001/api';

    function getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        try {
            const raw = sessionStorage.getItem('emcp_current_user');
            if (raw) {
                const user = JSON.parse(raw);
                if (user.role) headers['x-user-role'] = user.role;
                if (user.id) headers['x-user-id'] = user.id;
            }
        } catch { /* ignore */ }
        return headers;
    }

    async function api(path, opts = {}) {
        const url = `${API_BASE}${path}`;
        const res = await fetch(url, {
            headers: getHeaders(),
            ...opts,
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            const msg = body.message || body.error || `Request failed (${res.status})`;
            return { ok: false, error: Array.isArray(msg) ? msg.join(', ') : msg };
        }
        const data = await res.json().catch(() => ({}));
        return data;
    }

    // -------- Users
    async function listUsers() {
        const data = await api('/users');
        return Array.isArray(data) ? data : (data.ok === false ? [] : []);
    }

    async function getUser(id) {
        const data = await api(`/users/${id}`);
        return data.ok === false ? null : data;
    }

    async function getUserByEmail(email) {
        const users = await listUsers();
        return users.find(u => String(u.email).toLowerCase() === String(email).toLowerCase()) || null;
    }

    async function createUser(user) {
        const data = await api('/users/signup', {
            method: 'POST',
            body: JSON.stringify(user),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function updateUser(id, patch) {
        const data = await api(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function deleteUser(id) {
        const data = await api(`/users/${id}`, { method: 'DELETE' });
        return data.ok === false ? data : { ok: true };
    }

    // -------- Login
    async function login(email, password) {
        const data = await api('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        return data;
    }

    // -------- Venues
    async function listVenues() {
        const data = await api('/venues');
        return Array.isArray(data) ? data : [];
    }

    async function getVenue(id) {
        const data = await api(`/venues/${id}`);
        return data.ok === false ? null : data;
    }

    async function createVenue(venue) {
        const data = await api('/venues', {
            method: 'POST',
            body: JSON.stringify(venue),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function updateVenue(id, patch) {
        const data = await api(`/venues/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function deleteVenue(id) {
        const data = await api(`/venues/${id}`, { method: 'DELETE' });
        return data.ok === false ? data : { ok: true };
    }

    // -------- Resources
    async function listResources() {
        const data = await api('/resources');
        return Array.isArray(data) ? data : [];
    }

    async function getResource(id) {
        const data = await api(`/resources/${id}`);
        return data.ok === false ? null : data;
    }

    async function createResource(resource) {
        const data = await api('/resources', {
            method: 'POST',
            body: JSON.stringify(resource),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function updateResource(id, patch) {
        const data = await api(`/resources/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function deleteResource(id) {
        const data = await api(`/resources/${id}`, { method: 'DELETE' });
        return data.ok === false ? data : { ok: true };
    }

    // -------- Events
    async function listEvents() {
        const data = await api('/events');
        return Array.isArray(data) ? data : [];
    }

    async function getEvent(id) {
        const data = await api(`/events/${id}`);
        return data.ok === false ? null : data;
    }

    async function listEventsByOrganizer(organizerId) {
        const data = await api(`/events/organizer/${organizerId}`);
        return Array.isArray(data) ? data : [];
    }

    async function eventRegistrationsCount(eventId) {
        const data = await api(`/events/${eventId}/registrations-count`);
        return data.count != null ? data.count : 0;
    }

    async function createEvent(event) {
        const data = await api('/events', {
            method: 'POST',
            body: JSON.stringify(event),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function updateEvent(id, patch) {
        const data = await api(`/events/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function deleteEvent(id) {
        const data = await api(`/events/${id}`, { method: 'DELETE' });
        return data.ok === false ? data : { ok: true };
    }

    // -------- Registrations
    async function listRegistrations() {
        const data = await api('/registrations');
        return Array.isArray(data) ? data : [];
    }

    async function getRegistration(id) {
        const regs = await listRegistrations();
        return regs.find(r => r.id === id) || null;
    }

    async function listRegistrationsByUser(userId) {
        const data = await api(`/registrations/user/${userId}`);
        return Array.isArray(data) ? data : [];
    }

    async function listRegistrationsByEvent(eventId) {
        const data = await api(`/registrations/event/${eventId}`);
        return Array.isArray(data) ? data : [];
    }

    async function createRegistration({ userId, eventId }) {
        const data = await api('/registrations', {
            method: 'POST',
            body: JSON.stringify({ userId, eventId }),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function deleteRegistration(id) {
        const data = await api(`/registrations/${id}`, { method: 'DELETE' });
        return data.ok === false ? data : { ok: true };
    }

    // -------- Attendance
    async function listAttendance() {
        const data = await api('/attendance');
        return Array.isArray(data) ? data : [];
    }

    async function updateAttendanceByRegistration(regId, patch) {
        const data = await api(`/attendance/registration/${regId}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    // -------- Event Staff
    async function listEventStaff() {
        const data = await api('/event-staff');
        return Array.isArray(data) ? data : [];
    }

    async function createEventStaff(assignment) {
        const data = await api('/event-staff', {
            method: 'POST',
            body: JSON.stringify(assignment),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function updateEventStaff(id, patch) {
        const data = await api(`/event-staff/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function deleteEventStaff(id) {
        const data = await api(`/event-staff/${id}`, { method: 'DELETE' });
        return data.ok === false ? data : { ok: true };
    }

    // -------- Event Resources
    async function listEventResources() {
        const data = await api('/event-resources');
        return Array.isArray(data) ? data : [];
    }

    async function createEventResource(allocation) {
        const data = await api('/event-resources', {
            method: 'POST',
            body: JSON.stringify(allocation),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function updateEventResource(id, patch) {
        const data = await api(`/event-resources/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    async function deleteEventResource(id) {
        const data = await api(`/event-resources/${id}`, { method: 'DELETE' });
        return data.ok === false ? data : { ok: true };
    }

    // -------- Notifications
    async function listNotifications(userId) {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const data = await api(`/notifications${query}`);
        return Array.isArray(data) ? data : [];
    }

    async function addNotification(n) {
        const data = await api('/notifications', {
            method: 'POST',
            body: JSON.stringify(n),
        });
        if (data.ok === false) return data;
        return { ok: true, record: data.record || data };
    }

    window.EMCP = window.EMCP || {};
    window.EMCP.repo = {
        login,

        listUsers,
        getUser,
        getUserByEmail,
        createUser,
        updateUser,
        deleteUser,

        listVenues,
        getVenue,
        createVenue,
        updateVenue,
        deleteVenue,

        listResources,
        getResource,
        createResource,
        updateResource,
        deleteResource,

        listEvents,
        getEvent,
        listEventsByOrganizer,
        createEvent,
        updateEvent,
        deleteEvent,
        eventRegistrationsCount,

        listRegistrations,
        getRegistration,
        listRegistrationsByUser,
        listRegistrationsByEvent,
        createRegistration,
        deleteRegistration,

        listAttendance,
        updateAttendanceByRegistration,

        listEventStaff,
        createEventStaff,
        updateEventStaff,
        deleteEventStaff,

        listEventResources,
        createEventResource,
        updateEventResource,
        deleteEventResource,

        listNotifications,
        addNotification
    };
})();
