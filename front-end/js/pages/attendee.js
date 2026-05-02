(function () {
    'use strict';

    const { ROLES } = window.EMCP.constants;
    const { toast, escapeHtml, formatDate, formatTime, initModal } = window.EMCP.ui;

    let currentUser;
    let modal;
    let activeTab = 'upcoming';

    function setUserInfo() {
        document.getElementById('current-user-name').textContent = currentUser.name;
        const initials = currentUser.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0].toUpperCase())
            .join('');
        document.getElementById('att-avatar').textContent = initials || 'AT';
    }

    function isPast(e) {
        const d = new Date(e.eventDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    }

    async function renderBrowse(filter = '') {
        const grid = document.getElementById('events-grid');
        const empty = document.getElementById('events-empty');
        const q = String(filter || '').trim().toLowerCase();

        const venues = await window.EMCP.repo.listVenues();
        const events = (await window.EMCP.repo.listEvents())
            .filter((e) => (activeTab === 'past' ? isPast(e) : !isPast(e)))
            .filter((e) => !q || e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));

        if (events.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        const myRegs = new Set((await window.EMCP.repo.listRegistrationsByUser(currentUser.id)).map((r) => r.eventId));

        const cards = [];
        for (const e of events) {
            const venue = venues.find((v) => v.id === e.venueId);
            const regCount = await window.EMCP.repo.eventRegistrationsCount(e.id);
            const full = regCount >= Number(e.capacity);
            const registered = myRegs.has(e.id);
            const thumbStyle = e.imageUrl ? ` style="background-image: url('${escapeHtml(e.imageUrl)}')"` : '';

            const cta = registered
                ? `<button class="btn-secondary" data-action="details" data-id="${escapeHtml(e.id)}">View</button>
                   <button class="btn-ghost danger" data-action="unregister" data-id="${escapeHtml(e.id)}">Unregister</button>`
                : `<button class="btn-secondary" data-action="details" data-id="${escapeHtml(e.id)}">Details</button>
                   <button class="btn-primary" data-action="register" data-id="${escapeHtml(e.id)}" ${full ? 'disabled' : ''}>${full ? 'House Full' : 'Register'}</button>`;

            cards.push(`
                <article class="event-card">
                    <div class="event-thumb"${thumbStyle} aria-hidden="true"></div>
                    <div class="event-body">
                        <div class="event-title">${escapeHtml(e.title)}</div>
                        <div class="event-meta muted">
                            <span>${escapeHtml(formatDate(e.eventDate))}</span>
                            <span>•</span>
                            <span>${escapeHtml(formatTime(e.startTime))} - ${escapeHtml(formatTime(e.endTime))}</span>
                        </div>
                        <div class="event-meta muted">${escapeHtml(venue ? venue.venueName : '—')}</div>
                        <div class="event-chip-row">
                            <span class="chip">${escapeHtml(regCount)} / ${escapeHtml(e.capacity)} registered</span>
                        </div>
                        <div class="event-actions">${cta}</div>
                    </div>
                </article>`);
        }
        grid.innerHTML = cards.join('');
    }

    async function openEventDetails(eventId) {
        const e = await window.EMCP.repo.getEvent(eventId);
        if (!e) return;
        const venue = await window.EMCP.repo.getVenue(e.venueId);
        const regCount = await window.EMCP.repo.eventRegistrationsCount(e.id);

        const body = document.getElementById('modal-body');
        const title = document.getElementById('modal-title');
        if (title) title.textContent = 'Event Details';
        const heroStyle = e.imageUrl ? ` style="background-image: url('${escapeHtml(e.imageUrl)}')"` : '';

        body.innerHTML = `
            <div class="event-detail">
            <div class="event-detail-hero"${heroStyle} aria-hidden="true"></div>
                <h3>${escapeHtml(e.title)}</h3>
                <p class="muted">${escapeHtml(e.description || '—')}</p>
                <div class="detail-grid">
                    <div><div class="muted small">Date</div><div>${escapeHtml(formatDate(e.eventDate))}</div></div>
                    <div><div class="muted small">Time</div><div>${escapeHtml(formatTime(e.startTime))} - ${escapeHtml(formatTime(e.endTime))}</div></div>
                    <div><div class="muted small">Venue</div><div>${escapeHtml(venue ? venue.venueName : '—')}</div></div>
                    <div><div class="muted small">Capacity</div><div>${escapeHtml(regCount)} / ${escapeHtml(e.capacity)}</div></div>
                </div>
            </div>`;

        document.getElementById('modal')?.classList?.remove('hidden');
    }

    async function renderMyRegistrations() {
        const tbody = document.getElementById('my-registrations-body');
        const empty = document.getElementById('my-registrations-empty');

        const regs = await window.EMCP.repo.listRegistrationsByUser(currentUser.id);
        const events = await window.EMCP.repo.listEvents();
        const venues = await window.EMCP.repo.listVenues();

        if (regs.length === 0) {
            tbody.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        tbody.innerHTML = regs
            .map((r) => {
                const e = events.find((x) => x.id === r.eventId);
                const v = e ? venues.find((x) => x.id === e.venueId) : null;
                return `
                <tr>
                    <td><strong>${escapeHtml(e ? e.title : '—')}</strong></td>
                    <td>${escapeHtml(e ? formatDate(e.eventDate) : '—')}</td>
                    <td>${escapeHtml(v ? v.venueName : '—')}</td>
                    <td><span class="status-badge status-role">${escapeHtml(r.status || 'CONFIRMED')}</span></td>
                    <td>
                        <button class="action-btn" data-action="details" data-id="${escapeHtml(r.eventId)}">View</button>
                        <button class="action-btn delete" data-action="unregister" data-id="${escapeHtml(r.eventId)}">Unregister</button>
                    </td>
                </tr>`;
            })
            .join('');
    }

    async function unregister(eventId) {
        const regs = await window.EMCP.repo.listRegistrationsByUser(currentUser.id);
        const reg = regs.find((r) => r.eventId === eventId);
        if (!reg) return;
        await window.EMCP.repo.deleteRegistration(reg.id);
        toast('Registration cancelled.', 'success');
    }

    function bindActions() {
        const search = document.getElementById('global-search');
        const tabs = document.querySelectorAll('.tab[data-tab]');

        tabs.forEach((t) => {
            t.addEventListener('click', async () => {
                tabs.forEach((x) => x.classList.toggle('active', x === t));
                activeTab = t.dataset.tab;
                await renderBrowse(search.value);
            });
        });

        search.addEventListener('input', async () => await renderBrowse(search.value));

        document.body.addEventListener('click', async (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'details') {
                await openEventDetails(id);
            }

            if (action === 'register') {
                const res = await window.EMCP.repo.createRegistration({ userId: currentUser.id, eventId: id });
                if (!res.ok) return toast(res.error || 'Unable to register.', 'danger');
                toast('Registered successfully.', 'success');
                await renderBrowse(search.value);
                await renderMyRegistrations();
            }

            if (action === 'unregister') {
                if (confirm('Unregister from this event?')) {
                    await unregister(id);
                    await renderBrowse(search.value);
                    await renderMyRegistrations();
                }
            }
        });

        document.getElementById('modal-close')?.addEventListener('click', () => document.getElementById('modal')?.classList?.add('hidden'));
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal') document.getElementById('modal')?.classList?.add('hidden');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') document.getElementById('modal')?.classList?.add('hidden');
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        currentUser = window.EMCP.guard.enforceRoleOrRedirect([ROLES.ATTENDEE]);
        if (!currentUser) return;

        window.EMCP.guard.bindLogout();
        window.EMCP.guard.initSidebarNav();
        window.EMCP.guard.initSidebarToggle();

        setUserInfo();
        modal = initModal();

        await renderBrowse();
        await renderMyRegistrations();
        bindActions();

        const params = new URLSearchParams(window.location.search);
        const msg = params.get('msg');
        if (msg) toast(msg, 'info');
    });
})();
