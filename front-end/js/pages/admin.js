(function () {
    'use strict';

    const { ROLES } = window.EMCP.constants;
    const { RESOURCES, ACTIONS, can } = window.EMCP.rbac;
    const { qs, escapeHtml, toast, clearFormErrors, setFormErrors, initModal } = window.EMCP.ui;
    const { validate, required, positiveInt, nonNegativeInt, maxLength } = window.EMCP.validators;

    let currentUser;
    let nav;
    let modal;

    function setUserInfo() {
        document.getElementById('current-user-name').textContent = currentUser.name;
        const initials = currentUser.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0].toUpperCase())
            .join('');
        document.getElementById('admin-avatar').textContent = initials || 'AD';
    }

    function renderVenues(filter = '') {
        const tbody = document.getElementById('venues-table-body');
        const empty = document.getElementById('venues-empty');
        const q = String(filter || '').trim().toLowerCase();

        const rows = window.EMCP.repo
            .listVenues()
            .filter((v) =>
                !q ||
                String(v.venueName).toLowerCase().includes(q) ||
                String(v.location).toLowerCase().includes(q)
            );

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        tbody.innerHTML = rows
            .map((v) => {
                const statusClass = v.status === 'Active' ? 'status-active' : 'status-muted';
                return `
                <tr>
                    <td><strong>${escapeHtml(v.venueName)}</strong></td>
                    <td>${escapeHtml(v.location || '-')}</td>
                    <td>${escapeHtml(v.capacity)}</td>
                    <td><span class="status-badge ${statusClass}">${escapeHtml(v.status || 'Active')}</span></td>
                    <td>
                        <button class="action-btn" data-action="edit-venue" data-id="${escapeHtml(v.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-venue" data-id="${escapeHtml(v.id)}">Delete</button>
                    </td>
                </tr>`;
            })
            .join('');
    }

    function renderResources(filter = '') {
        const tbody = document.getElementById('resources-table-body');
        const empty = document.getElementById('resources-empty');
        const q = String(filter || '').trim().toLowerCase();

        const rows = window.EMCP.repo
            .listResources()
            .filter((r) => !q || String(r.resourceName).toLowerCase().includes(q));

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        tbody.innerHTML = rows
            .map((r) =>
                `
                <tr>
                    <td><strong>${escapeHtml(r.resourceName)}</strong></td>
                    <td>${escapeHtml(r.quantity)}</td>
                    <td>
                        <button class="action-btn" data-action="edit-resource" data-id="${escapeHtml(r.id)}">Edit</button>
                        <button class="action-btn delete" data-action="delete-resource" data-id="${escapeHtml(r.id)}">Delete</button>
                    </td>
                </tr>`
            )
            .join('');
    }

    function openVenueModal(mode, venueId) {
        if (!can(currentUser.role, mode === 'create' ? ACTIONS.CREATE : ACTIONS.UPDATE, RESOURCES.VENUES)) {
            toast('Access denied.', 'danger');
            return;
        }

        const venue = venueId ? window.EMCP.repo.getVenue(venueId) : null;
        const title = mode === 'create' ? 'Add New Venue' : 'Edit Venue';

        const formHtml = `
            <input type="hidden" name="id" value="${venue ? escapeHtml(venue.id) : ''}" />
            <div class="form-group">
                <label for="venueName">Venue Name</label>
                <input id="venueName" name="venueName" type="text" value="${venue ? escapeHtml(venue.venueName) : ''}" />
                <span class="error-msg" data-error-for="venueName"></span>
            </div>
            <div class="form-group">
                <label for="location">Location</label>
                <input id="location" name="location" type="text" value="${venue ? escapeHtml(venue.location || '') : ''}" />
                <span class="error-msg" data-error-for="location"></span>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="capacity">Capacity</label>
                    <input id="capacity" name="capacity" type="number" min="1" step="1" value="${venue ? escapeHtml(venue.capacity) : ''}" />
                    <span class="error-msg" data-error-for="capacity"></span>
                </div>
                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="Active" ${venue?.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Under Maintenance" ${venue?.status === 'Under Maintenance' ? 'selected' : ''}>Under Maintenance</option>
                        <option value="Fully Booked" ${venue?.status === 'Fully Booked' ? 'selected' : ''}>Fully Booked</option>
                    </select>
                    <span class="error-msg" data-error-for="status"></span>
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
                    venueName: form.venueName.value,
                    location: form.location.value,
                    capacity: form.capacity.value,
                    status: form.status.value
                };

                const errors = validate(fields, {
                    venueName: [required('Venue name'), maxLength('Venue name', 150)],
                    location: [maxLength('Location', 200)],
                    capacity: [positiveInt('Capacity')],
                    status: [required('Status')]
                });

                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, qs('#modal-summary'));
                    return;
                }

                const saveRes = venue
                    ? window.EMCP.repo.updateVenue(venue.id, {
                          venueName: fields.venueName.trim(),
                          location: fields.location.trim(),
                          capacity: Number(fields.capacity),
                          status: fields.status
                      })
                    : window.EMCP.repo.createVenue({
                          venueName: fields.venueName.trim(),
                          location: fields.location.trim(),
                          capacity: Number(fields.capacity),
                          status: fields.status
                      });

                if (!saveRes.ok) {
                    toast(saveRes.error || 'Unable to save venue.', 'danger');
                    return;
                }

                toast('Venue saved.', 'success');
                modal.close();
                renderVenues(document.getElementById('global-search')?.value);
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function openResourceModal(mode, resourceId) {
        if (!can(currentUser.role, mode === 'create' ? ACTIONS.CREATE : ACTIONS.UPDATE, RESOURCES.RESOURCES)) {
            toast('Access denied.', 'danger');
            return;
        }

        const resource = resourceId ? window.EMCP.repo.getResource(resourceId) : null;
        const title = mode === 'create' ? 'Add New Resource' : 'Edit Resource';

        const formHtml = `
            <input type="hidden" name="id" value="${resource ? escapeHtml(resource.id) : ''}" />
            <div class="form-group">
                <label for="resourceName">Resource Name</label>
                <input id="resourceName" name="resourceName" type="text" value="${resource ? escapeHtml(resource.resourceName) : ''}" />
                <span class="error-msg" data-error-for="resourceName"></span>
            </div>
            <div class="form-group">
                <label for="quantity">Quantity</label>
                <input id="quantity" name="quantity" type="number" min="0" step="1" value="${resource ? escapeHtml(resource.quantity) : ''}" />
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
                const fields = {
                    resourceName: form.resourceName.value,
                    quantity: form.quantity.value
                };

                const errors = validate(fields, {
                    resourceName: [required('Resource name'), maxLength('Resource name', 150)],
                    quantity: [nonNegativeInt('Quantity')]
                });

                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, qs('#modal-summary'));
                    return;
                }

                const saveRes = resource
                    ? window.EMCP.repo.updateResource(resource.id, {
                          resourceName: fields.resourceName.trim(),
                          quantity: Number(fields.quantity)
                      })
                    : window.EMCP.repo.createResource({
                          resourceName: fields.resourceName.trim(),
                          quantity: Number(fields.quantity)
                      });

                if (!saveRes.ok) {
                    toast(saveRes.error || 'Unable to save resource.', 'danger');
                    return;
                }

                toast('Resource saved.', 'success');
                modal.close();
                renderResources(document.getElementById('global-search')?.value);
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function bindActions() {
        const primary = document.getElementById('primary-action');
        const search = document.getElementById('global-search');

        function activeModule() {
            return document.querySelector('.nav-item.active')?.dataset?.module || 'venues';
        }

        primary.addEventListener('click', () => {
            const module = activeModule();
            if (module === 'venues') openVenueModal('create');
            if (module === 'resources') openResourceModal('create');
        });

        search.addEventListener('input', () => {
            const module = activeModule();
            if (module === 'venues') renderVenues(search.value);
            if (module === 'resources') renderResources(search.value);
        });

        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'edit-venue') openVenueModal('edit', id);
            if (action === 'delete-venue') {
                if (!can(currentUser.role, ACTIONS.DELETE, RESOURCES.VENUES)) return toast('Access denied.', 'danger');
                if (confirm('Delete this venue? This will also remove dependent events.')) {
                    window.EMCP.repo.deleteVenue(id);
                    toast('Venue deleted.', 'success');
                    renderVenues(search.value);
                }
            }

            if (action === 'edit-resource') openResourceModal('edit', id);
            if (action === 'delete-resource') {
                if (!can(currentUser.role, ACTIONS.DELETE, RESOURCES.RESOURCES)) return toast('Access denied.', 'danger');
                if (confirm('Delete this resource?')) {
                    window.EMCP.repo.deleteResource(id);
                    toast('Resource deleted.', 'success');
                    renderResources(search.value);
                }
            }
        });

        // update titles based on nav
        document.querySelectorAll('.nav-item[data-module]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const module = btn.dataset.module;
                document.getElementById('page-title').textContent = module === 'venues' ? 'Venue Management' : 'Resource Inventory';
                document.getElementById('primary-action').textContent = module === 'venues' ? '+ Add New Venue' : '+ Add New Resource';
                search.value = '';
                if (module === 'venues') renderVenues('');
                if (module === 'resources') renderResources('');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        currentUser = window.EMCP.guard.enforceRoleOrRedirect([ROLES.ADMIN]);
        if (!currentUser) return;

        window.EMCP.guard.bindLogout();
        window.EMCP.guard.initSidebarToggle();
        nav = window.EMCP.guard.initSidebarNav();
        modal = initModal();

        setUserInfo();
        renderVenues();
        renderResources();

        const primary = document.getElementById('primary-action');
        if (primary) primary.textContent = '+ Add New Venue';

        bindActions();

        const params = new URLSearchParams(window.location.search);
        const msg = params.get('msg');
        if (msg) toast(msg, 'info');
    });
})();
