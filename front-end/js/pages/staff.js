(function () {
    'use strict';

    const { ROLES } = window.EMCP.constants;
    const { toast, escapeHtml, formatDate, formatTime, initModal, clearFormErrors, setFormErrors } = window.EMCP.ui;
    const { validate, required, maxLength } = window.EMCP.validators;

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
        document.getElementById('staff-avatar').textContent = initials || 'ST';
    }

    function assignments() {
        return window.EMCP.repo.listEventStaff().filter((a) => a.staffId === currentUser.id);
    }

    function renderStats() {
        const el = document.getElementById('stats-row');
        if (!el) return;
        const done = assignments().filter((a) => a.status === 'DONE').length;
        const upcoming = assignments().length;
        const pending = assignments().filter((a) => a.status === 'ASSIGNED').length;

        el.innerHTML = [
            { label: 'Total Tasks Completed', value: done },
            { label: 'Upcoming Shifts', value: upcoming },
            { label: 'Pending Requests', value: pending },
            { label: 'Volunteer Hours', value: (upcoming * 3).toFixed(1) }
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

    function renderUpcoming() {
        const wrap = document.getElementById('upcoming-tasks');
        const empty = document.getElementById('upcoming-empty');
        const events = window.EMCP.repo.listEvents();

        const rows = assignments();
        if (rows.length === 0) {
            wrap.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        wrap.innerHTML = rows
            .slice(0, 2)
            .map((a) => {
                const e = events.find((x) => x.id === a.eventId);
                return `
                <div class="task-row">
                    <div class="task-thumb" aria-hidden="true"></div>
                    <div class="task-info">
                        <div class="task-event">${escapeHtml(e ? e.title : '—')}</div>
                        <div class="muted small">${escapeHtml(a.role)} • ${escapeHtml(a.shiftStart)} - ${escapeHtml(a.shiftEnd)}</div>
                    </div>
                    <button class="btn-secondary" type="button" data-nav-module="tasks">Details</button>
                </div>`;
            })
            .join('');
    }

    function renderNotifications() {
        const wrap = document.getElementById('recent-notifications');
        const list = document.getElementById('notifications-list');
        const empty = document.getElementById('notifications-empty');

        const rows = window.EMCP.repo.listNotifications(currentUser.id);
        const html = rows
            .slice(0, 3)
            .map(
                (n) => `
                <div class="notif">
                    <div class="notif-title">${escapeHtml(n.title)}</div>
                    <div class="muted small">${escapeHtml(n.message)}</div>
                    <div class="muted tiny">${escapeHtml(new Date(n.createdAt).toLocaleString())}</div>
                </div>`
            )
            .join('');

        if (wrap) wrap.innerHTML = html;
        if (list) list.innerHTML = rows.map((n) => `<div class="notif">${escapeHtml(n.title)}<div class="muted small">${escapeHtml(n.message)}</div></div>`).join('');

        if (rows.length === 0) empty.classList.remove('hidden');
        else empty.classList.add('hidden');
    }

    function renderTasks(filter = '') {
        const tbody = document.getElementById('tasks-table-body');
        const empty = document.getElementById('tasks-empty');
        const q = String(filter || '').trim().toLowerCase();

        const events = window.EMCP.repo.listEvents();
        const rows = assignments().filter((a) => {
            const e = events.find((x) => x.id === a.eventId);
            return !q || (e?.title || '').toLowerCase().includes(q) || (a.role || '').toLowerCase().includes(q);
        });

        if (rows.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = rows
            .map((a) => {
                const e = events.find((x) => x.id === a.eventId);
                return `
                <tr>
                    <td><strong>${escapeHtml(e ? e.title : '—')}</strong></td>
                    <td>${escapeHtml(a.role)}</td>
                    <td>${escapeHtml(a.shiftStart)} - ${escapeHtml(a.shiftEnd)}</td>
                    <td><span class="status-badge status-role">${escapeHtml(a.status)}</span></td>
                    <td>
                        <button class="action-btn" data-action="update-task" data-id="${escapeHtml(a.id)}">Update</button>
                    </td>
                </tr>`;
            })
            .join('');
    }

    function openTaskModal(assignmentId) {
        const a = assignments().find((x) => x.id === assignmentId);
        if (!a) return;

        const formHtml = `
            <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status">
                    <option value="ASSIGNED" ${a.status === 'ASSIGNED' ? 'selected' : ''}>ASSIGNED</option>
                    <option value="IN_PROGRESS" ${a.status === 'IN_PROGRESS' ? 'selected' : ''}>IN_PROGRESS</option>
                    <option value="DONE" ${a.status === 'DONE' ? 'selected' : ''}>DONE</option>
                </select>
                <span class="error-msg" data-error-for="status"></span>
            </div>
            <div class="form-group">
                <label for="note">Note (optional)</label>
                <input id="note" name="note" type="text" placeholder="Shift time changed…" />
                <span class="error-msg" data-error-for="note"></span>
            </div>
            <div class="form-error-summary hidden" id="modal-summary" role="alert"></div>
            <div class="modal-actions">
                <button class="btn-secondary" type="button" id="modal-cancel">Cancel</button>
                <button class="btn-primary" type="submit">Save</button>
            </div>`;

        modal.open({
            title: 'Update Task',
            formHtml,
            onSubmit: (form) => {
                clearFormErrors(form);
                const fields = { status: form.status.value, note: form.note.value };
                const errors = validate(fields, {
                    status: [required('Status')],
                    note: [maxLength('Note', 120)]
                });
                if (Object.keys(errors).length > 0) {
                    setFormErrors(form, errors, document.getElementById('modal-summary'));
                    return;
                }

                window.EMCP.repo.updateEventStaff(a.id, { status: fields.status });

                if (fields.note && fields.note.trim()) {
                    window.EMCP.repo.addNotification({
                        userId: currentUser.id,
                        title: 'Task updated',
                        message: fields.note.trim(),
                        type: 'info'
                    });
                }

                toast('Task updated.', 'success');
                modal.close();
                renderStats();
                renderUpcoming();
                renderTasks(document.getElementById('global-search')?.value);
                renderNotifications();
            }
        });

        document.getElementById('modal-cancel')?.addEventListener('click', () => modal.close());
    }

    function bindActions() {
        const search = document.getElementById('global-search');
        search.addEventListener('input', () => renderTasks(search.value));

        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            if (btn.dataset.action === 'update-task') openTaskModal(btn.dataset.id);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        currentUser = window.EMCP.guard.enforceRoleOrRedirect([ROLES.STAFF]);
        if (!currentUser) return;

        window.EMCP.guard.bindLogout();
        window.EMCP.guard.initSidebarNav();
        window.EMCP.guard.initSidebarToggle();
        modal = initModal();

        setUserInfo();
        renderStats();
        renderUpcoming();
        renderNotifications();
        renderTasks();
        bindActions();

        const params = new URLSearchParams(window.location.search);
        const msg = params.get('msg');
        if (msg) toast(msg, 'info');
    });
})();
