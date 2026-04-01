(function () {
    'use strict';

    const { ROLES } = window.EMCP.constants;
    const { toast, escapeHtml, formatDate, formatTime, clearFormErrors, setFormErrors, initModal } = window.EMCP.ui;
    const { validate, required, positiveInt, maxLength, optionalUrl } = window.EMCP.validators;

    let currentUser;
    let modal;

    function setUserInfo() {
        document.getElementById('current-user-name').textContent = currentUser.name;
        const initials = currentUser.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0].toUpperCase())
            .join('');
        document.getElementById('org-avatar').textContent = initials || 'OR';
    }

    function myEvents() {
        return window.EMCP.repo.listEventsByOrganizer(currentUser.id);
    }

    function renderEvents(filter = '') {
        const tbody = document.getElementById('events-table-body');
        const empty = document.getElementById('events-empty');
        const q = String(filter || '').trim().toLowerCase();

        const venues = window.EMCP.repo.listVenues();
        const rows = myEvents().filter((e) => !q || e.title.toLowerCase().includes(q));

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = rows
            .map((e) => {
                const venue = venues.find((v) => v.id === e.venueId);
                return `
                <tr>
                    <td><strong>${escapeHtml(e.title)}</strong></td>
                    <td>${escapeHtml(formatDate(e.eventDate))}</td>
                    <td>${escapeHtml(formatTime(e.startTime))} - ${escapeHtml(formatTime(e.endTime))}</td>
                    <td>${escapeHtml(venue ? venue.venueName : '—')}</td>
                    <td>${escapeHtml(e.capacity)}</td>
                    <td>
                        <button class="action-btn" data-action="edit-event" data-id="${escapeHtml(e.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-event" data-id="${escapeHtml(e.id)}">Delete</button>
                    </td>
                </tr>`;
            })
            .join('');
    }

    function openEventModal(mode, eventId) {
        const existing = eventId ? window.EMCP.repo.getEvent(eventId) : null;
        if (existing && existing.organizerId !== currentUser.id) {
            toast('Access denied: cannot edit another organizer’s event.', 'danger');
            return;
        }

        const venues = window.EMCP.repo.listVenues().filter((v) => v.status === 'Active');
        const venueOptions = venues
            .map((v) => `<option value="${escapeHtml(v.id)}" ${existing?.venueId === v.id ? 'selected' : ''}>${escapeHtml(v.venueName)} (${escapeHtml(v.capacity)})</option>`)
            .join('');

        const title = mode === 'create' ? 'Create Event' : 'Edit Event';
        const formHtml = `
            <div class="form-group">
                <label for="title">Title</label>
                <input id="title" name="title" type="text" value="${existing ? escapeHtml(existing.title) : ''}" />
                <span class="error-msg" data-error-for="title"></span>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="3">${existing ? escapeHtml(existing.description || '') : ''}</textarea>
                <span class="error-msg" data-error-for="description"></span>
            </div>
            <div class="form-group">
                <label for="imageUrl">Event Image URL</label>
                <input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/event.jpg" value="${existing ? escapeHtml(existing.imageUrl || '') : ''}" />
                <span class="error-msg" data-error-for="imageUrl"></span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="eventDate">Event Date</label>
                    <input id="eventDate" name="eventDate" type="date" value="${existing ? escapeHtml(existing.eventDate) : ''}" />
                    <span class="error-msg" data-error-for="eventDate"></span>
                </div>
                <div class="form-group">
                    <label for="capacity">Capacity</label>
                    <input id="capacity" name="capacity" type="number" min="1" step="1" value="${existing ? escapeHtml(existing.capacity) : ''}" />
                    <span class="error-msg" data-error-for="capacity"></span>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="startTime">Start</label>
                    <input id="startTime" name="startTime" type="time" value="${existing ? escapeHtml(existing.startTime) : ''}" />
                    <span class="error-msg" data-error-for="startTime"></span>
                </div>
                <div class="form-group">
                    <label for="endTime">End</label>
                    <input id="endTime" name="endTime" type="time" value="${existing ? escapeHtml(existing.endTime) : ''}" />
                    <span class="error-msg" data-error-for="endTime"></span>
                </div>
            </div>
            <div class="form-group">
                <label for="venueId">Venue</label>
                <select id="venueId" name="venueId">
                    <option value="">Select venue</option>
                    ${venueOptions}
                </select>
                <span class="error-msg" data-error-for="venueId"></span>
            </div>
            <div class="form-error-summary hidden" id="modal-summary" role="alert"></div>
            <div class="modal-actions">
                <button class="btn-secondary" type="button" id="modal-cancel">Cancel</button>
                <button class="btn-primary" type="submit">Save</button>
            </div>`;

        modal.open({
            title,
            formHtml,
            onSubmit: (form) => {
                clearFormErrors(form);

                const fields = {
                    title: form.title.value,
                    description: form.description.value,
                    imageUrl: form.imageUrl.value,
                    eventDate: form.eventDate.value,
                    capacity: form.capacity.value,
                    startTime: form.startTime.value,
                    endTime: form.endTime.value,
                    venueId: form.venueId.value
                };

                const errors = validate(fields, {
                    title: [required('Title'), maxLength('Title', 200)],
                    description: [maxLength('Description', 800)],
                    imageUrl: [maxLength('Image URL', 500), optionalUrl('Image URL')],
                    eventDate: [required('Event date')],
                    capacity: [positiveInt('Capacity')],
                    startTime: [required('Start time')],
                    endTime: [required('End time')],
                    venueId: [required('Venue')]
                });

                if (fields.startTime && fields.endTime && String(fields.endTime) <= String(fields.startTime)) {
                    errors.endTime = 'End time must be after start time.';
                }

                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, document.getElementById('modal-summary'));
                    return;
                }

                const res = existing
                    ? window.EMCP.repo.updateEvent(existing.id, {
                          title: fields.title.trim(),
                          description: fields.description.trim(),
                          imageUrl: String(fields.imageUrl || '').trim(),
                          eventDate: fields.eventDate,
                          capacity: Number(fields.capacity),
                          startTime: fields.startTime,
                          endTime: fields.endTime,
                          venueId: fields.venueId
                      })
                    : window.EMCP.repo.createEvent({
                          title: fields.title.trim(),
                          description: fields.description.trim(),
                          imageUrl: String(fields.imageUrl || '').trim(),
                          eventDate: fields.eventDate,
                          capacity: Number(fields.capacity),
                          startTime: fields.startTime,
                          endTime: fields.endTime,
                          venueId: fields.venueId,
                          organizerId: currentUser.id
                      });

                if (!res.ok) {
                    toast(res.error || 'Unable to save event.', 'danger');
                    return;
                }

                toast('Event saved.', 'success');
                modal.close();
                renderEvents(document.getElementById('global-search')?.value);
                populateEventFilter();
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function populateEventFilter() {
        const select = document.getElementById('event-filter');
        if (!select) return;
        const events = myEvents();
        select.innerHTML = events.map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.title)}</option>`).join('');
        renderRegistrationsFor(select.value);
        select.addEventListener('change', () => renderRegistrationsFor(select.value));
    }

    function renderRegistrationsFor(eventId) {
        const tbody = document.getElementById('org-registrations-body');
        const empty = document.getElementById('org-registrations-empty');
        const regs = window.EMCP.repo.listRegistrationsByEvent(eventId);
        const users = window.EMCP.repo.listUsers();

        if (!eventId || regs.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = regs
            .map((r) => {
                const u = users.find((x) => x.id === r.userId);
                return `
                <tr>
                    <td><strong>${escapeHtml(u ? u.name : '—')}</strong></td>
                    <td>${escapeHtml(u ? u.email : '—')}</td>
                    <td><span class="status-badge status-role">${escapeHtml(r.status)}</span></td>
                    <td>${escapeHtml(new Date(r.registrationDate).toLocaleString())}</td>
                </tr>`;
            })
            .join('');
    }

    function renderAssignments() {
        // For organizer view, show assignments for their events.
        const tbody = document.getElementById('staff-table-body');
        const empty = document.getElementById('staff-empty');

        const myEventIds = new Set(myEvents().map((e) => e.id));
        const assignments = window.EMCP.repo.listEventStaff().filter((a) => myEventIds.has(a.eventId));
        const users = window.EMCP.repo.listUsers();
        const events = window.EMCP.repo.listEvents();

        if (assignments.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = assignments
            .map((a) => {
                const e = events.find((x) => x.id === a.eventId);
                const u = users.find((x) => x.id === a.staffId);
                return `
                <tr>
                    <td>${escapeHtml(e ? e.title : '—')}</td>
                    <td>${escapeHtml(u ? u.name : '—')}</td>
                    <td>${escapeHtml(a.role)}</td>
                    <td><span class="status-badge status-role">${escapeHtml(a.status)}</span></td>
                    <td>
                        <button class="action-btn" data-action="edit-assignment" data-id="${escapeHtml(a.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-assignment" data-id="${escapeHtml(a.id)}">Delete</button>
                    </td>
                </tr>`;
            })
            .join('');
    }

    function openAssignmentModal(mode, assignmentId) {
        const myEventIds = new Set(myEvents().map((e) => e.id));
        const existing = assignmentId ? window.EMCP.repo.listEventStaff().find((a) => a.id === assignmentId) : null;
        if (existing && !myEventIds.has(existing.eventId)) {
            toast('Access denied.', 'danger');
            return;
        }

        const events = myEvents();
        const staff = window.EMCP.repo.listUsers().filter((u) => u.role === 'STAFF');
        const eventOptions = events.map((e) => `<option value="${escapeHtml(e.id)}" ${existing?.eventId === e.id ? 'selected' : ''}>${escapeHtml(e.title)}</option>`).join('');
        const staffOptions = staff.map((u) => `<option value="${escapeHtml(u.id)}" ${existing?.staffId === u.id ? 'selected' : ''}>${escapeHtml(u.name)}</option>`).join('');

        const title = mode === 'create' ? 'Assign Volunteer' : 'Edit Assignment';
        const formHtml = `
            <div class="form-row">
                <div class="form-group">
                    <label for="eventId">Event</label>
                    <select id="eventId" name="eventId">${eventOptions}</select>
                    <span class="error-msg" data-error-for="eventId"></span>
                </div>
                <div class="form-group">
                    <label for="staffId">Volunteer</label>
                    <select id="staffId" name="staffId">${staffOptions}</select>
                    <span class="error-msg" data-error-for="staffId"></span>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="role">Task Role</label>
                    <input id="role" name="role" type="text" value="${existing ? escapeHtml(existing.role) : ''}" placeholder="Main Stage Setup" />
                    <span class="error-msg" data-error-for="role"></span>
                </div>
                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="ASSIGNED" ${existing?.status === 'ASSIGNED' ? 'selected' : ''}>ASSIGNED</option>
                        <option value="IN_PROGRESS" ${existing?.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
                        <option value="DONE" ${existing?.status === 'DONE' ? 'selected' : ''}>DONE</option>
                    </select>
                    <span class="error-msg" data-error-for="status"></span>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="shiftStart">Shift Start</label>
                    <input id="shiftStart" name="shiftStart" type="time" value="${existing ? escapeHtml(existing.shiftStart) : '09:00'}" />
                    <span class="error-msg" data-error-for="shiftStart"></span>
                </div>
                <div class="form-group">
                    <label for="shiftEnd">Shift End</label>
                    <input id="shiftEnd" name="shiftEnd" type="time" value="${existing ? escapeHtml(existing.shiftEnd) : '12:00'}" />
                    <span class="error-msg" data-error-for="shiftEnd"></span>
                </div>
            </div>
            <div class="form-error-summary hidden" id="modal-summary" role="alert"></div>
            <div class="modal-actions">
                <button class="btn-secondary" type="button" id="modal-cancel">Cancel</button>
                <button class="btn-primary" type="submit">Save</button>
            </div>`;

        modal.open({
            title,
            formHtml,
            onSubmit: (form) => {
                clearFormErrors(form);
                const fields = {
                    eventId: form.eventId.value,
                    staffId: form.staffId.value,
                    role: form.role.value,
                    status: form.status.value,
                    shiftStart: form.shiftStart.value,
                    shiftEnd: form.shiftEnd.value
                };

                const errors = validate(fields, {
                    eventId: [required('Event')],
                    staffId: [required('Volunteer')],
                    role: [required('Task role'), maxLength('Task role', 100)],
                    status: [required('Status')],
                    shiftStart: [required('Shift start')],
                    shiftEnd: [required('Shift end')]
                });

                if (fields.shiftStart && fields.shiftEnd && String(fields.shiftEnd) <= String(fields.shiftStart)) {
                    errors.shiftEnd = 'Shift end must be after shift start.';
                }

                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, document.getElementById('modal-summary'));
                    return;
                }

                const res = existing
                    ? window.EMCP.repo.updateEventStaff(existing.id, { ...fields, role: fields.role.trim() })
                    : window.EMCP.repo.createEventStaff({ ...fields, role: fields.role.trim() });

                if (!res.ok) {
                    toast(res.error || 'Unable to save assignment.', 'danger');
                    return;
                }

                toast('Assignment saved.', 'success');
                modal.close();
                renderAssignments();
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function renderEventResources() {
        const tbody = document.getElementById('event-resources-body');
        const empty = document.getElementById('event-resources-empty');

        const myEventIds = new Set(myEvents().map((e) => e.id));
        const allocations = window.EMCP.repo.listEventResources().filter((er) => myEventIds.has(er.eventId));
        const events = window.EMCP.repo.listEvents();
        const resources = window.EMCP.repo.listResources();

        if (allocations.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = allocations
            .map((a) => {
                const e = events.find((x) => x.id === a.eventId);
                const r = resources.find((x) => x.id === a.resourceId);
                return `
                <tr>
                    <td>${escapeHtml(e ? e.title : '—')}</td>
                    <td>${escapeHtml(r ? r.resourceName : '—')}</td>
                    <td>${escapeHtml(a.quantityUsed)}</td>
                    <td>
                        <button class="action-btn" data-action="edit-allocation" data-id="${escapeHtml(a.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-allocation" data-id="${escapeHtml(a.id)}">Delete</button>
                    </td>
                </tr>`;
            })
            .join('');
    }

    function openResourceAllocationModal(mode, allocationId) {
        const myEventIds = new Set(myEvents().map((e) => e.id));
        const existing = allocationId ? window.EMCP.repo.listEventResources().find((er) => er.id === allocationId) : null;
        if (existing && !myEventIds.has(existing.eventId)) {
            toast('Access denied.', 'danger');
            return;
        }

        const events = myEvents();
        const resources = window.EMCP.repo.listResources();
        const eventOptions = events.map((e) => `<option value="${escapeHtml(e.id)}" ${existing?.eventId === e.id ? 'selected' : ''}>${escapeHtml(e.title)}</option>`).join('');
        const resOptions = resources.map((r) => `<option value="${escapeHtml(r.id)}" ${existing?.resourceId === r.id ? 'selected' : ''}>${escapeHtml(r.resourceName)} (${escapeHtml(r.quantity)})</option>`).join('');

        const title = mode === 'create' ? 'Allocate Resource' : 'Edit Allocation';
        const formHtml = `
            <div class="form-row">
                <div class="form-group">
                    <label for="eventId">Event</label>
                    <select id="eventId" name="eventId">${eventOptions}</select>
                    <span class="error-msg" data-error-for="eventId"></span>
                </div>
                <div class="form-group">
                    <label for="resourceId">Resource</label>
                    <select id="resourceId" name="resourceId">${resOptions}</select>
                    <span class="error-msg" data-error-for="resourceId"></span>
                </div>
            </div>
            <div class="form-group">
                <label for="quantityUsed">Quantity Used</label>
                <input id="quantityUsed" name="quantityUsed" type="number" min="1" step="1" value="${existing ? escapeHtml(existing.quantityUsed) : 1}" />
                <span class="error-msg" data-error-for="quantityUsed"></span>
            </div>
            <div class="form-error-summary hidden" id="modal-summary" role="alert"></div>
            <div class="modal-actions">
                <button class="btn-secondary" type="button" id="modal-cancel">Cancel</button>
                <button class="btn-primary" type="submit">Save</button>
            </div>`;

        modal.open({
            title,
            formHtml,
            onSubmit: (form) => {
                clearFormErrors(form);

                const fields = {
                    eventId: form.eventId.value,
                    resourceId: form.resourceId.value,
                    quantityUsed: form.quantityUsed.value
                };

                const errors = validate(fields, {
                    eventId: [required('Event')],
                    resourceId: [required('Resource')],
                    quantityUsed: [positiveInt('Quantity used')]
                });

                const resource = window.EMCP.repo.getResource(fields.resourceId);
                if (resource && Number(fields.quantityUsed) > Number(resource.quantity)) {
                    errors.quantityUsed = 'Quantity used cannot exceed available quantity.';
                }

                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, document.getElementById('modal-summary'));
                    return;
                }

                const res = existing
                    ? window.EMCP.repo.updateEventResource(existing.id, { ...fields, quantityUsed: Number(fields.quantityUsed) })
                    : window.EMCP.repo.createEventResource({ ...fields, quantityUsed: Number(fields.quantityUsed) });

                if (!res.ok) {
                    toast(res.error || 'Unable to save allocation.', 'danger');
                    return;
                }

                toast('Resource allocation saved.', 'success');
                modal.close();
                renderEventResources();
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function bindActions() {
        const primary = document.getElementById('primary-action');
        const search = document.getElementById('global-search');

        function activeModule() {
            return document.querySelector('.nav-item.active')?.dataset?.module || 'events';
        }

        function updatePrimary() {
            const module = activeModule();
            if (module === 'events') primary.textContent = '+ Create Event';
            else if (module === 'staff') primary.textContent = '+ Assign Volunteer';
            else if (module === 'resources') primary.textContent = '+ Allocate Resource';
            else primary.textContent = '+ Create';
        }

        primary.addEventListener('click', () => {
            const module = activeModule();
            if (module === 'events') return openEventModal('create');
            if (module === 'staff') return openAssignmentModal('create');
            if (module === 'resources') return openResourceAllocationModal('create');
            toast('Select a module to create a record.', 'info');
        });

        search.addEventListener('input', () => {
            const module = activeModule();
            if (module === 'events') renderEvents(search.value);
        });

        document.querySelectorAll('.nav-item[data-module]').forEach((btn) => {
            btn.addEventListener('click', () => {
                updatePrimary();
                search.value = '';
                if (btn.dataset.module === 'registrations') populateEventFilter();
                if (btn.dataset.module === 'staff') renderAssignments();
                if (btn.dataset.module === 'resources') renderEventResources();
            });
        });

        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'edit-event') return openEventModal('edit', id);
            if (action === 'delete-event') {
                const ev = window.EMCP.repo.getEvent(id);
                if (!ev) return;
                if (ev.organizerId !== currentUser.id) return toast('Access denied.', 'danger');
                if (confirm('Delete this event? This will remove dependent registrations and assignments.')) {
                    window.EMCP.repo.deleteEvent(id);
                    toast('Event deleted.', 'success');
                    renderEvents(search.value);
                    populateEventFilter();
                }
            }

            if (action === 'edit-assignment') return openAssignmentModal('edit', id);
            if (action === 'delete-assignment') {
                if (confirm('Delete this assignment?')) {
                    window.EMCP.repo.deleteEventStaff(id);
                    toast('Assignment deleted.', 'success');
                    renderAssignments();
                }
            }

            if (action === 'edit-allocation') return openResourceAllocationModal('edit', id);
            if (action === 'delete-allocation') {
                if (confirm('Delete this allocation?')) {
                    window.EMCP.repo.deleteEventResource(id);
                    toast('Allocation deleted.', 'success');
                    renderEventResources();
                }
            }
        });

        updatePrimary();
    }

    document.addEventListener('DOMContentLoaded', () => {
        currentUser = window.EMCP.guard.enforceRoleOrRedirect([ROLES.ORGANIZER]);
        if (!currentUser) return;

        window.EMCP.guard.bindLogout();
        window.EMCP.guard.initSidebarNav();
        modal = initModal();

        setUserInfo();
        renderEvents();
        populateEventFilter();
        renderAssignments();
        renderEventResources();
        bindActions();

        const params = new URLSearchParams(window.location.search);
        const msg = params.get('msg');
        if (msg) toast(msg, 'info');
    });
})();
