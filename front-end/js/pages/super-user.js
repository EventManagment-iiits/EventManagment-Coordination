(function () {
    'use strict';

    const { ROLES } = window.EMCP.constants;
    const { RESOURCES, ACTIONS, can } = window.EMCP.rbac;
    const { qs, escapeHtml, toast, clearFormErrors, setFormErrors, initModal, formatDate, formatTime } = window.EMCP.ui;
    const { validate, required, email, password, positiveInt, nonNegativeInt, maxLength, optionalUrl } = window.EMCP.validators;

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
        document.getElementById('su-avatar').textContent = initials || 'SU';
    }

    function renderStats() {
        const el = document.getElementById('stats-row');
        if (!el) return;
        const users = window.EMCP.repo.listUsers().length;
        const events = window.EMCP.repo.listEvents().length;
        const venues = window.EMCP.repo.listVenues().length;
        const regs = window.EMCP.repo.listRegistrations().length;

        el.innerHTML = [
            { label: 'Total Users', value: users },
            { label: 'Active Events', value: events },
            { label: 'Venues', value: venues },
            { label: 'Registrations', value: regs }
        ]
            .map(
                (s) => `
                <div class="stat-card">
                    <div class="stat-label muted">${escapeHtml(s.label)}</div>
                    <div class="stat-value">${escapeHtml(s.value)}</div>
                </div>`
            )
            .join('');
    }

    function renderUsers(filter = '') {
        const tbody = document.getElementById('users-table-body');
        const empty = document.getElementById('users-empty');
        const q = String(filter || '').trim().toLowerCase();

        const rows = window.EMCP.repo
            .listUsers()
            .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = rows
            .map((u) => {
                const roleBadge = `<span class="status-badge status-role">${escapeHtml(u.role)}</span>`;
                const statusBadge = `<span class="status-badge status-active">${escapeHtml(u.status || 'Active')}</span>`;
                const actions = u.role === ROLES.SUPER_USER
                    ? `<span class="muted small">Protected</span>`
                    : `
                        <button class="action-btn" data-action="edit-user" data-id="${escapeHtml(u.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-user" data-id="${escapeHtml(u.id)}">Delete</button>`;

                return `
                <tr>
                    <td><strong>${escapeHtml(u.name)}</strong></td>
                    <td>${escapeHtml(u.email)}</td>
                    <td>${roleBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${actions}</td>
                </tr>`;
            })
            .join('');
    }

    function openUserModal(mode, userId) {
        if (!can(currentUser.role, mode === 'create' ? ACTIONS.CREATE : ACTIONS.UPDATE, RESOURCES.USERS)) {
            toast('Access denied.', 'danger');
            return;
        }

        const existing = userId ? window.EMCP.repo.getUser(userId) : null;
        const title = mode === 'create' ? 'Add New User' : 'Edit User';

        const formHtml = `
            <input type="hidden" name="id" value="${existing ? escapeHtml(existing.id) : ''}" />
            <div class="form-group">
                <label for="name">Full Name</label>
                <input id="name" name="name" type="text" value="${existing ? escapeHtml(existing.name) : ''}" />
                <span class="error-msg" data-error-for="name"></span>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" value="${existing ? escapeHtml(existing.email) : ''}" />
                <span class="error-msg" data-error-for="email"></span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" name="role">
                        <option value="ADMIN" ${existing?.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                        <option value="ORGANIZER" ${existing?.role === 'ORGANIZER' ? 'selected' : ''}>Organizer</option>
                        <option value="ATTENDEE" ${existing?.role === 'ATTENDEE' ? 'selected' : ''}>Attendee</option>
                        <option value="STAFF" ${existing?.role === 'STAFF' ? 'selected' : ''}>Staff</option>
                    </select>
                    <span class="error-msg" data-error-for="role"></span>
                </div>
                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="Active" ${existing?.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${existing?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                    <span class="error-msg" data-error-for="status"></span>
                </div>
            </div>
            <div class="form-group">
                <label for="orgDept">Organization / Dept</label>
                <input id="orgDept" name="orgDept" type="text" value="${existing ? escapeHtml(existing.orgDept || '') : ''}" />
                <span class="error-msg" data-error-for="orgDept"></span>
            </div>
            ${
                existing
                    ? ''
                    : `
            <div class="form-group">
                <label for="password">Temporary Password</label>
                <input id="password" name="password" type="password" value="password123" />
                <span class="error-msg" data-error-for="password"></span>
            </div>`
            }
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
                    name: form.name.value,
                    email: form.email.value,
                    role: form.role.value,
                    status: form.status.value,
                    orgDept: form.orgDept.value,
                    password: form.password?.value
                };

                const rules = {
                    name: [required('Full name'), maxLength('Full name', 100)],
                    email: [email(), maxLength('Email', 150)],
                    role: [required('Role')],
                    status: [required('Status')],
                    orgDept: [maxLength('Organization / Dept', 120)]
                };
                if (!existing) rules.password = [password()];

                const errors = validate(fields, rules);
                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, qs('#modal-summary'));
                    return;
                }

                const res = existing
                    ? window.EMCP.repo.updateUser(existing.id, {
                          name: fields.name.trim(),
                          email: fields.email,
                          role: fields.role,
                          status: fields.status,
                          orgDept: fields.orgDept.trim()
                      })
                    : window.EMCP.repo.createUser({
                          name: fields.name.trim(),
                          email: fields.email,
                          password: fields.password,
                          role: fields.role,
                          status: fields.status,
                          orgDept: fields.orgDept.trim()
                      });

                if (!res.ok) {
                    setFormErrors(form, { email: res.error || 'Unable to save user.' }, qs('#modal-summary'));
                    return;
                }

                toast('User saved.', 'success');
                modal.close();
                renderUsers(document.getElementById('global-search')?.value);
                renderStats();
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function renderVenues(filter = '') {
        const tbody = document.getElementById('venues-table-body');
        const empty = document.getElementById('venues-empty');
        const q = String(filter || '').trim().toLowerCase();

        const rows = window.EMCP.repo.listVenues().filter((v) => !q || v.venueName.toLowerCase().includes(q) || (v.location || '').toLowerCase().includes(q));
        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = rows
            .map((v) => `
                <tr>
                    <td><strong>${escapeHtml(v.venueName)}</strong></td>
                    <td>${escapeHtml(v.location || '-')}</td>
                    <td>${escapeHtml(v.capacity)}</td>
                    <td>
                        <button class="action-btn" data-action="edit-venue" data-id="${escapeHtml(v.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-venue" data-id="${escapeHtml(v.id)}">Delete</button>
                    </td>
                </tr>`)
            .join('');
    }

    function openVenueModal(mode, venueId) {
        const existing = venueId ? window.EMCP.repo.getVenue(venueId) : null;
        const title = mode === 'create' ? 'Add New Venue' : 'Edit Venue';

        const formHtml = `
            <div class="form-group">
                <label for="venueName">Venue Name</label>
                <input id="venueName" name="venueName" type="text" value="${existing ? escapeHtml(existing.venueName) : ''}" />
                <span class="error-msg" data-error-for="venueName"></span>
            </div>
            <div class="form-group">
                <label for="location">Location</label>
                <input id="location" name="location" type="text" value="${existing ? escapeHtml(existing.location || '') : ''}" />
                <span class="error-msg" data-error-for="location"></span>
            </div>
            <div class="form-group">
                <label for="capacity">Capacity</label>
                <input id="capacity" name="capacity" type="number" min="1" step="1" value="${existing ? escapeHtml(existing.capacity) : ''}" />
                <span class="error-msg" data-error-for="capacity"></span>
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
                const fields = { venueName: form.venueName.value, location: form.location.value, capacity: form.capacity.value };
                const errors = validate(fields, {
                    venueName: [required('Venue name'), maxLength('Venue name', 150)],
                    location: [maxLength('Location', 200)],
                    capacity: [positiveInt('Capacity')]
                });

                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, qs('#modal-summary'));
                    return;
                }

                const res = existing
                    ? window.EMCP.repo.updateVenue(existing.id, { venueName: fields.venueName.trim(), location: fields.location.trim(), capacity: Number(fields.capacity) })
                    : window.EMCP.repo.createVenue({ venueName: fields.venueName.trim(), location: fields.location.trim(), capacity: Number(fields.capacity), status: 'Active' });

                if (!res.ok) {
                    toast(res.error || 'Unable to save venue.', 'danger');
                    return;
                }

                toast('Venue saved.', 'success');
                modal.close();
                renderVenues(document.getElementById('global-search')?.value);
                renderStats();
            }
        });
        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function renderResources(filter = '') {
        const tbody = document.getElementById('resources-table-body');
        const empty = document.getElementById('resources-empty');
        const q = String(filter || '').trim().toLowerCase();
        const rows = window.EMCP.repo.listResources().filter((r) => !q || r.resourceName.toLowerCase().includes(q));

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');
        tbody.innerHTML = rows
            .map((r) => `
                <tr>
                    <td><strong>${escapeHtml(r.resourceName)}</strong></td>
                    <td>${escapeHtml(r.quantity)}</td>
                    <td>
                        <button class="action-btn" data-action="edit-resource" data-id="${escapeHtml(r.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-resource" data-id="${escapeHtml(r.id)}">Delete</button>
                    </td>
                </tr>`)
            .join('');
    }

    function openResourceModal(mode, resourceId) {
        const existing = resourceId ? window.EMCP.repo.getResource(resourceId) : null;
        const title = mode === 'create' ? 'Add New Resource' : 'Edit Resource';

        const formHtml = `
            <div class="form-group">
                <label for="resourceName">Resource Name</label>
                <input id="resourceName" name="resourceName" type="text" value="${existing ? escapeHtml(existing.resourceName) : ''}" />
                <span class="error-msg" data-error-for="resourceName"></span>
            </div>
            <div class="form-group">
                <label for="quantity">Quantity</label>
                <input id="quantity" name="quantity" type="number" min="0" step="1" value="${existing ? escapeHtml(existing.quantity) : ''}" />
                <span class="error-msg" data-error-for="quantity"></span>
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
                const fields = { resourceName: form.resourceName.value, quantity: form.quantity.value };
                const errors = validate(fields, {
                    resourceName: [required('Resource name'), maxLength('Resource name', 150)],
                    quantity: [nonNegativeInt('Quantity')]
                });
                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, qs('#modal-summary'));
                    return;
                }

                const res = existing
                    ? window.EMCP.repo.updateResource(existing.id, { resourceName: fields.resourceName.trim(), quantity: Number(fields.quantity) })
                    : window.EMCP.repo.createResource({ resourceName: fields.resourceName.trim(), quantity: Number(fields.quantity) });

                if (!res.ok) {
                    toast(res.error || 'Unable to save resource.', 'danger');
                    return;
                }

                toast('Resource saved.', 'success');
                modal.close();
                renderResources(document.getElementById('global-search')?.value);
                renderStats();
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function renderEvents(filter = '') {
        const tbody = document.getElementById('events-table-body');
        const empty = document.getElementById('events-empty');
        const q = String(filter || '').trim().toLowerCase();

        const venues = window.EMCP.repo.listVenues();
        const users = window.EMCP.repo.listUsers();

        const rows = window.EMCP.repo.listEvents().filter((e) => !q || e.title.toLowerCase().includes(q));

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = rows
            .map((e) => {
                const venue = venues.find((v) => v.id === e.venueId);
                const organizer = users.find((u) => u.id === e.organizerId);
                return `
                <tr>
                    <td><strong>${escapeHtml(e.title)}</strong></td>
                    <td>${escapeHtml(formatDate(e.eventDate))}</td>
                    <td>${escapeHtml(formatTime(e.startTime))} - ${escapeHtml(formatTime(e.endTime))}</td>
                    <td>${escapeHtml(venue ? venue.venueName : '—')}</td>
                    <td>${escapeHtml(e.capacity)}</td>
                    <td>${escapeHtml(organizer ? organizer.name : '—')}</td>
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
        const venues = window.EMCP.repo.listVenues().filter((v) => v.status === 'Active');
        const organizers = window.EMCP.repo.listUsers().filter((u) => u.role === 'ORGANIZER');

        const title = mode === 'create' ? 'Create Event' : 'Edit Event';

        const venueOptions = venues
            .map((v) => `<option value="${escapeHtml(v.id)}" ${existing?.venueId === v.id ? 'selected' : ''}>${escapeHtml(v.venueName)} (${escapeHtml(v.capacity)})</option>`)
            .join('');

        const orgOptions = organizers
            .map((u) => `<option value="${escapeHtml(u.id)}" ${existing?.organizerId === u.id ? 'selected' : ''}>${escapeHtml(u.name)}</option>`)
            .join('');

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
            <div class="form-row">
                <div class="form-group">
                    <label for="venueId">Venue</label>
                    <select id="venueId" name="venueId">
                        <option value="">Select venue</option>
                        ${venueOptions}
                    </select>
                    <span class="error-msg" data-error-for="venueId"></span>
                </div>
                <div class="form-group">
                    <label for="organizerId">Organizer</label>
                    <select id="organizerId" name="organizerId">
                        <option value="">Select organizer</option>
                        ${orgOptions}
                    </select>
                    <span class="error-msg" data-error-for="organizerId"></span>
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
                    title: form.title.value,
                    description: form.description.value,
                    imageUrl: form.imageUrl.value,
                    eventDate: form.eventDate.value,
                    capacity: form.capacity.value,
                    startTime: form.startTime.value,
                    endTime: form.endTime.value,
                    venueId: form.venueId.value,
                    organizerId: form.organizerId.value
                };

                const errors = validate(fields, {
                    title: [required('Title'), maxLength('Title', 200)],
                    description: [maxLength('Description', 800)],
                    imageUrl: [maxLength('Image URL', 500), optionalUrl('Image URL')],
                    eventDate: [required('Event date')],
                    capacity: [positiveInt('Capacity')],
                    startTime: [required('Start time')],
                    endTime: [required('End time')],
                    venueId: [required('Venue')],
                    organizerId: [required('Organizer')]
                });

                if (!fields.startTime || !fields.endTime) {
                    // already captured
                } else if (String(fields.endTime) <= String(fields.startTime)) {
                    errors.endTime = 'End time must be after start time.';
                }

                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, qs('#modal-summary'));
                    return;
                }

                const saveRes = existing
                    ? window.EMCP.repo.updateEvent(existing.id, {
                          title: fields.title.trim(),
                          description: fields.description.trim(),
                          imageUrl: String(fields.imageUrl || '').trim(),
                          eventDate: fields.eventDate,
                          capacity: Number(fields.capacity),
                          startTime: fields.startTime,
                          endTime: fields.endTime,
                          venueId: fields.venueId,
                          organizerId: fields.organizerId
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
                          organizerId: fields.organizerId
                      });

                if (!saveRes.ok) {
                    toast(saveRes.error || 'Unable to save event.', 'danger');
                    return;
                }

                toast('Event saved.', 'success');
                modal.close();
                renderEvents(document.getElementById('global-search')?.value);
                renderStats();
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function renderRegistrations(filter = '') {
        const tbody = document.getElementById('registrations-table-body');
        const empty = document.getElementById('registrations-empty');
        const q = String(filter || '').trim().toLowerCase();

        const users = window.EMCP.repo.listUsers();
        const events = window.EMCP.repo.listEvents();

        const rows = window.EMCP.repo.listRegistrations().filter((r) => {
            if (!q) return true;
            const user = users.find((u) => u.id === r.userId);
            const event = events.find((e) => e.id === r.eventId);
            return (user?.name || '').toLowerCase().includes(q) || (event?.title || '').toLowerCase().includes(q) || (r.status || '').toLowerCase().includes(q);
        });

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = rows
            .map((r) => {
                const user = users.find((u) => u.id === r.userId);
                const event = events.find((e) => e.id === r.eventId);
                return `
                <tr>
                    <td>${escapeHtml(user ? user.name : '—')}</td>
                    <td>${escapeHtml(event ? event.title : '—')}</td>
                    <td><span class="status-badge status-role">${escapeHtml(r.status || 'CONFIRMED')}</span></td>
                    <td>${escapeHtml(new Date(r.registrationDate).toLocaleString())}</td>
                    <td>
                        <button class="action-btn delete" data-action="delete-registration" data-id="${escapeHtml(r.id)}">Delete</button>
                    </td>
                </tr>`;
            })
            .join('');
    }

    function bindNav() {
        window.EMCP.guard.initSidebarNav();
        const search = document.getElementById('global-search');
        const primary = document.getElementById('primary-action');

        function activeModule() {
            return document.querySelector('.nav-item.active')?.dataset?.module || 'dashboard';
        }

        function updatePrimaryLabel(module) {
            if (!primary) return;
            if (module === 'users') primary.textContent = '+ Add User';
            else if (module === 'venues') primary.textContent = '+ Add Venue';
            else if (module === 'resources') primary.textContent = '+ Add Resource';
            else if (module === 'events') primary.textContent = '+ Create Event';
            else primary.textContent = '+ Create';
        }

        document.querySelectorAll('.nav-item[data-module]').forEach((btn) => {
            btn.addEventListener('click', () => {
                updatePrimaryLabel(btn.dataset.module);
                if (search) search.value = '';
                renderAll();
            });
        });

        updatePrimaryLabel(activeModule());

        primary.addEventListener('click', () => {
            const module = activeModule();
            if (module === 'users') return openUserModal('create');
            if (module === 'venues') return openVenueModal('create');
            if (module === 'resources') return openResourceModal('create');
            if (module === 'events') return openEventModal('create');
            toast('Select a module to create a record.', 'info');
        });

        search.addEventListener('input', () => {
            const module = activeModule();
            if (module === 'users') renderUsers(search.value);
            if (module === 'venues') renderVenues(search.value);
            if (module === 'resources') renderResources(search.value);
            if (module === 'events') renderEvents(search.value);
            if (module === 'registrations') renderRegistrations(search.value);
        });

        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'edit-user') return openUserModal('edit', id);
            if (action === 'delete-user') {
                const user = window.EMCP.repo.getUser(id);
                if (!user) return;
                if (confirm('Delete this user? This will remove related records.')) {
                    window.EMCP.repo.deleteUser(id);
                    toast('User deleted.', 'success');
                    renderUsers(search.value);
                    renderStats();
                }
            }

            if (action === 'edit-venue') return openVenueModal('edit', id);
            if (action === 'delete-venue') {
                if (confirm('Delete this venue? This will also remove dependent events.')) {
                    window.EMCP.repo.deleteVenue(id);
                    toast('Venue deleted.', 'success');
                    renderVenues(search.value);
                    renderStats();
                }
            }

            if (action === 'edit-resource') return openResourceModal('edit', id);
            if (action === 'delete-resource') {
                if (confirm('Delete this resource?')) {
                    window.EMCP.repo.deleteResource(id);
                    toast('Resource deleted.', 'success');
                    renderResources(search.value);
                    renderStats();
                }
            }

            if (action === 'edit-event') return openEventModal('edit', id);
            if (action === 'delete-event') {
                if (confirm('Delete this event? This will also remove registrations and assignments.')) {
                    window.EMCP.repo.deleteEvent(id);
                    toast('Event deleted.', 'success');
                    renderEvents(search.value);
                    renderStats();
                }
            }

            if (action === 'delete-registration') {
                if (confirm('Delete this registration?')) {
                    window.EMCP.repo.deleteRegistration(id);
                    toast('Registration deleted.', 'success');
                    renderRegistrations(search.value);
                    renderStats();
                }
            }
        });
    }

    function renderAll() {
        renderStats();
        renderUsers(document.getElementById('global-search')?.value);
        renderVenues(document.getElementById('global-search')?.value);
        renderResources(document.getElementById('global-search')?.value);
        renderEvents(document.getElementById('global-search')?.value);
        renderRegistrations(document.getElementById('global-search')?.value);
    }

    document.addEventListener('DOMContentLoaded', () => {
        currentUser = window.EMCP.guard.enforceRoleOrRedirect([ROLES.SUPER_USER]);
        if (!currentUser) return;

        window.EMCP.guard.bindLogout();
        window.EMCP.guard.initSidebarToggle();
        modal = initModal();

        setUserInfo();
        bindNav();
        renderAll();

        const params = new URLSearchParams(window.location.search);
        const msg = params.get('msg');
        if (msg) toast(msg, 'info');
    });
})();
