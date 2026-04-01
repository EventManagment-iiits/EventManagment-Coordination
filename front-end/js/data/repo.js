(function () {
    'use strict';

    const { STORAGE_KEYS, ROLES } = window.EMCP.constants;

    function safeParse(raw, fallback) {
        try {
            if (!raw) return fallback;
            const val = JSON.parse(raw);
            return val ?? fallback;
        } catch {
            return fallback;
        }
    }

    function get(key, fallback = []) {
        return safeParse(localStorage.getItem(key), fallback);
    }

    function set(key, rows) {
        localStorage.setItem(key, JSON.stringify(rows));
    }

    function id(prefix) {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function byId(rows, idVal) {
        return rows.find((r) => r.id === idVal) || null;
    }

    function removeById(rows, idVal) {
        return rows.filter((r) => r.id !== idVal);
    }

    function nowIso() {
        return new Date().toISOString();
    }

    // -------- Users
    function listUsers() {
        return get(STORAGE_KEYS.USERS);
    }

    function getUser(idVal) {
        return byId(listUsers(), idVal);
    }

    function getUserByEmail(email) {
        const e = String(email || '').trim().toLowerCase();
        return listUsers().find((u) => String(u.email).toLowerCase() === e) || null;
    }

    function createUser(user) {
        const users = listUsers();
        const email = String(user.email || '').trim().toLowerCase();
        if (users.some((u) => String(u.email).toLowerCase() === email)) {
            return { ok: false, error: 'Email already exists.' };
        }
        const record = {
            id: id('u'),
            name: String(user.name || '').trim(),
            email,
            password: String(user.password || ''),
            role: user.role,
            status: user.status || 'Active',
            orgDept: user.orgDept || '',
            createdAt: nowIso()
        };
        users.push(record);
        set(STORAGE_KEYS.USERS, users);
        return { ok: true, record };
    }

    function updateUser(idVal, patch) {
        const users = listUsers();
        const idx = users.findIndex((u) => u.id === idVal);
        if (idx === -1) return { ok: false, error: 'User not found.' };

        if (patch.email) {
            const email = String(patch.email).trim().toLowerCase();
            const dup = users.some((u) => u.id !== idVal && String(u.email).toLowerCase() === email);
            if (dup) return { ok: false, error: 'Email already exists.' };
            patch.email = email;
        }

        users[idx] = { ...users[idx], ...patch };
        set(STORAGE_KEYS.USERS, users);
        return { ok: true, record: users[idx] };
    }

    function deleteUser(idVal) {
        // Cascade delete events, registrations, attendance, staff assignments
        const events = listEvents().filter((e) => e.organizerId === idVal);
        events.forEach((e) => deleteEvent(e.id));

        const regs = listRegistrations().filter((r) => r.userId === idVal);
        regs.forEach((r) => deleteRegistration(r.id));

        const staff = listEventStaff().filter((a) => a.staffId === idVal);
        set(STORAGE_KEYS.EVENT_STAFF, listEventStaff().filter((a) => a.staffId !== idVal));

        const users = removeById(listUsers(), idVal);
        set(STORAGE_KEYS.USERS, users);
        return { ok: true };
    }

    // -------- Venues
    function listVenues() {
        return get(STORAGE_KEYS.VENUES);
    }

    function getVenue(idVal) {
        return byId(listVenues(), idVal);
    }

    function createVenue(venue) {
        const venues = listVenues();
        const record = {
            id: id('v'),
            venueName: String(venue.venueName || '').trim(),
            location: String(venue.location || '').trim(),
            capacity: Number(venue.capacity),
            status: venue.status || 'Active'
        };
        venues.push(record);
        set(STORAGE_KEYS.VENUES, venues);
        return { ok: true, record };
    }

    function updateVenue(idVal, patch) {
        const venues = listVenues();
        const idx = venues.findIndex((v) => v.id === idVal);
        if (idx === -1) return { ok: false, error: 'Venue not found.' };
        venues[idx] = { ...venues[idx], ...patch, capacity: patch.capacity != null ? Number(patch.capacity) : venues[idx].capacity };
        set(STORAGE_KEYS.VENUES, venues);
        return { ok: true, record: venues[idx] };
    }

    function deleteVenue(idVal) {
        // Cascade delete events
        const events = listEvents().filter((e) => e.venueId === idVal);
        events.forEach((e) => deleteEvent(e.id));
        set(STORAGE_KEYS.VENUES, removeById(listVenues(), idVal));
        return { ok: true };
    }

    // -------- Resources
    function listResources() {
        return get(STORAGE_KEYS.RESOURCES);
    }

    function getResource(idVal) {
        return byId(listResources(), idVal);
    }

    function createResource(resource) {
        const rows = listResources();
        const record = {
            id: id('r'),
            resourceName: String(resource.resourceName || '').trim(),
            quantity: Number(resource.quantity)
        };
        rows.push(record);
        set(STORAGE_KEYS.RESOURCES, rows);
        return { ok: true, record };
    }

    function updateResource(idVal, patch) {
        const rows = listResources();
        const idx = rows.findIndex((r) => r.id === idVal);
        if (idx === -1) return { ok: false, error: 'Resource not found.' };
        rows[idx] = { ...rows[idx], ...patch, quantity: patch.quantity != null ? Number(patch.quantity) : rows[idx].quantity };
        set(STORAGE_KEYS.RESOURCES, rows);
        return { ok: true, record: rows[idx] };
    }

    function deleteResource(idVal) {
        // Remove event resource allocations
        set(STORAGE_KEYS.EVENT_RESOURCES, listEventResources().filter((er) => er.resourceId !== idVal));
        set(STORAGE_KEYS.RESOURCES, removeById(listResources(), idVal));
        return { ok: true };
    }

    // -------- Events
    function listEvents() {
        return get(STORAGE_KEYS.EVENTS);
    }

    function getEvent(idVal) {
        return byId(listEvents(), idVal);
    }

    function listEventsByOrganizer(organizerId) {
        return listEvents().filter((e) => e.organizerId === organizerId);
    }

    function eventRegistrationsCount(eventId) {
        return listRegistrations().filter((r) => r.eventId === eventId).length;
    }

    function venueHasConflict({ venueId, eventDate, startTime, endTime, excludeEventId = null }) {
        const sameDay = listEvents().filter((e) => e.venueId === venueId && e.eventDate === eventDate && e.id !== excludeEventId);
        const s = String(startTime);
        const e = String(endTime);
        return sameDay.some((x) => !(e <= x.startTime || s >= x.endTime));
    }

    function createEvent(event) {
        const venues = listVenues();
        const venue = venues.find((v) => v.id === event.venueId);
        if (!venue) return { ok: false, error: 'Venue not found.' };

        const capacity = Number(event.capacity);
        if (capacity > Number(venue.capacity)) {
            return { ok: false, error: 'Event capacity cannot exceed venue capacity.' };
        }

        if (venueHasConflict({ venueId: event.venueId, eventDate: event.eventDate, startTime: event.startTime, endTime: event.endTime })) {
            return { ok: false, error: 'Venue is already booked for the selected time.' };
        }

        const rows = listEvents();
        const record = {
            id: id('e'),
            title: String(event.title || '').trim(),
            description: String(event.description || '').trim(),
            imageUrl: String(event.imageUrl || '').trim(),
            eventDate: event.eventDate,
            startTime: event.startTime,
            endTime: event.endTime,
            capacity,
            organizerId: event.organizerId,
            venueId: event.venueId
        };
        rows.push(record);
        set(STORAGE_KEYS.EVENTS, rows);
        return { ok: true, record };
    }

    function updateEvent(idVal, patch) {
        const rows = listEvents();
        const idx = rows.findIndex((e) => e.id === idVal);
        if (idx === -1) return { ok: false, error: 'Event not found.' };

        const next = { ...rows[idx], ...patch };
        if (patch.imageUrl != null) {
            next.imageUrl = String(patch.imageUrl || '').trim();
        }

        const venue = getVenue(next.venueId);
        if (!venue) return { ok: false, error: 'Venue not found.' };

        if (Number(next.capacity) > Number(venue.capacity)) {
            return { ok: false, error: 'Event capacity cannot exceed venue capacity.' };
        }

        if (venueHasConflict({ venueId: next.venueId, eventDate: next.eventDate, startTime: next.startTime, endTime: next.endTime, excludeEventId: idVal })) {
            return { ok: false, error: 'Venue is already booked for the selected time.' };
        }

        rows[idx] = { ...next, capacity: Number(next.capacity) };
        set(STORAGE_KEYS.EVENTS, rows);
        return { ok: true, record: rows[idx] };
    }

    function deleteEvent(idVal) {
        // Cascade delete registrations/attendance, staff, resource allocations
        const regs = listRegistrations().filter((r) => r.eventId === idVal);
        regs.forEach((r) => deleteRegistration(r.id));
        set(STORAGE_KEYS.EVENT_STAFF, listEventStaff().filter((a) => a.eventId !== idVal));
        set(STORAGE_KEYS.EVENT_RESOURCES, listEventResources().filter((er) => er.eventId !== idVal));
        set(STORAGE_KEYS.EVENTS, removeById(listEvents(), idVal));
        return { ok: true };
    }

    // -------- Registrations
    function listRegistrations() {
        return get(STORAGE_KEYS.REGISTRATIONS);
    }

    function getRegistration(idVal) {
        return byId(listRegistrations(), idVal);
    }

    function listRegistrationsByUser(userId) {
        return listRegistrations().filter((r) => r.userId === userId);
    }

    function listRegistrationsByEvent(eventId) {
        return listRegistrations().filter((r) => r.eventId === eventId);
    }

    function createRegistration({ userId, eventId }) {
        const event = getEvent(eventId);
        if (!event) return { ok: false, error: 'Event not found.' };

        const user = getUser(userId);
        if (!user) return { ok: false, error: 'User not found.' };

        if (listRegistrations().some((r) => r.userId === userId && r.eventId === eventId)) {
            return { ok: false, error: 'You are already registered for this event.' };
        }

        const count = eventRegistrationsCount(eventId);
        if (count >= Number(event.capacity)) {
            return { ok: false, error: 'House Full: event capacity reached.' };
        }

        const rows = listRegistrations();
        const record = {
            id: id('reg'),
            userId,
            eventId,
            status: 'CONFIRMED',
            registrationDate: nowIso()
        };
        rows.push(record);
        set(STORAGE_KEYS.REGISTRATIONS, rows);

        const attendanceRows = listAttendance();
        attendanceRows.push({ id: id('a'), registrationId: record.id, status: 'PENDING', attendanceTime: null });
        set(STORAGE_KEYS.ATTENDANCE, attendanceRows);

        return { ok: true, record };
    }

    function deleteRegistration(idVal) {
        const rows = removeById(listRegistrations(), idVal);
        set(STORAGE_KEYS.REGISTRATIONS, rows);
        set(STORAGE_KEYS.ATTENDANCE, listAttendance().filter((a) => a.registrationId !== idVal));
        return { ok: true };
    }

    // -------- Attendance
    function listAttendance() {
        return get(STORAGE_KEYS.ATTENDANCE);
    }

    function updateAttendanceByRegistration(regId, patch) {
        const rows = listAttendance();
        const idx = rows.findIndex((a) => a.registrationId === regId);
        if (idx === -1) return { ok: false, error: 'Attendance record not found.' };
        rows[idx] = { ...rows[idx], ...patch };
        set(STORAGE_KEYS.ATTENDANCE, rows);
        return { ok: true, record: rows[idx] };
    }

    // -------- Event Staff
    function listEventStaff() {
        return get(STORAGE_KEYS.EVENT_STAFF);
    }

    function createEventStaff(assignment) {
        const rows = listEventStaff();
        const record = {
            id: id('as'),
            eventId: assignment.eventId,
            staffId: assignment.staffId,
            role: String(assignment.role || '').trim(),
            shiftStart: assignment.shiftStart,
            shiftEnd: assignment.shiftEnd,
            status: assignment.status || 'ASSIGNED'
        };
        rows.push(record);
        set(STORAGE_KEYS.EVENT_STAFF, rows);
        return { ok: true, record };
    }

    function updateEventStaff(idVal, patch) {
        const rows = listEventStaff();
        const idx = rows.findIndex((a) => a.id === idVal);
        if (idx === -1) return { ok: false, error: 'Assignment not found.' };
        rows[idx] = { ...rows[idx], ...patch };
        set(STORAGE_KEYS.EVENT_STAFF, rows);
        return { ok: true, record: rows[idx] };
    }

    function deleteEventStaff(idVal) {
        set(STORAGE_KEYS.EVENT_STAFF, removeById(listEventStaff(), idVal));
        return { ok: true };
    }

    // -------- Event Resources
    function listEventResources() {
        return get(STORAGE_KEYS.EVENT_RESOURCES);
    }

    function createEventResource(allocation) {
        const rows = listEventResources();
        const record = {
            id: id('er'),
            eventId: allocation.eventId,
            resourceId: allocation.resourceId,
            quantityUsed: Number(allocation.quantityUsed)
        };
        rows.push(record);
        set(STORAGE_KEYS.EVENT_RESOURCES, rows);
        return { ok: true, record };
    }

    function updateEventResource(idVal, patch) {
        const rows = listEventResources();
        const idx = rows.findIndex((a) => a.id === idVal);
        if (idx === -1) return { ok: false, error: 'Allocation not found.' };
        rows[idx] = { ...rows[idx], ...patch, quantityUsed: patch.quantityUsed != null ? Number(patch.quantityUsed) : rows[idx].quantityUsed };
        set(STORAGE_KEYS.EVENT_RESOURCES, rows);
        return { ok: true, record: rows[idx] };
    }

    function deleteEventResource(idVal) {
        set(STORAGE_KEYS.EVENT_RESOURCES, removeById(listEventResources(), idVal));
        return { ok: true };
    }

    // -------- Notifications
    function listNotifications(userId) {
        const rows = get(STORAGE_KEYS.NOTIFICATIONS);
        return userId ? rows.filter((n) => n.userId === userId) : rows;
    }

    function addNotification(n) {
        const rows = get(STORAGE_KEYS.NOTIFICATIONS);
        const record = { id: id('n'), ...n, createdAt: n.createdAt || nowIso() };
        rows.unshift(record);
        set(STORAGE_KEYS.NOTIFICATIONS, rows);
        return { ok: true, record };
    }

    // -------- Login helper
    function login(email, password) {
        const user = getUserByEmail(email);
        if (!user) return { ok: false, error: 'Invalid credentials.' };
        if (String(password) !== String(user.password)) return { ok: false, error: 'Invalid credentials.' };
        return { ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
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
