(function () {
    'use strict';

    const { escapeHtml, formatDate, formatTime, toast } = window.EMCP.ui;

    async function renderUpcoming() {
        const grid = document.getElementById('landing-events');
        const empty = document.getElementById('landing-events-empty');
        if (!grid || !empty) return;

        const events = await window.EMCP.repo.listEvents();
        const venues = await window.EMCP.repo.listVenues();

        const upcoming = events
            .slice()
            .sort((a, b) => (a.eventDate + a.startTime).localeCompare(b.eventDate + b.startTime))
            .slice(0, 3);

        if (upcoming.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        grid.innerHTML = upcoming
            .map((e) => {
                const venue = venues.find((v) => v.id === e.venueId);
                const venueLabel = venue ? `${venue.venueName}` : 'Venue TBD';
                const thumbStyle = e.imageUrl ? ` style="background-image: url('${escapeHtml(e.imageUrl)}')"` : '';
                return `
                <article class="event-card">
                    <div class="event-thumb"${thumbStyle} aria-hidden="true"></div>
                    <div class="event-body">
                        <div class="event-title">${escapeHtml(e.title)}</div>
                        <div class="event-meta muted">
                            <span>${escapeHtml(formatDate(e.eventDate))}</span>
                            <span>•</span>
                            <span>${escapeHtml(formatTime(e.startTime))} - ${escapeHtml(formatTime(e.endTime))}</span>
                        </div>
                        <div class="event-meta muted">${escapeHtml(venueLabel)}</div>
                        <div class="event-actions">
                            <a class="btn-secondary" href="/login">Details</a>
                            <a class="btn-primary" href="/login">Register</a>
                        </div>
                    </div>
                </article>`;
            })
            .join('');
    }

    function initHeaderLinks() {
        const user = window.EMCP.session.getCurrentUser();
        const loginLink = document.querySelector('a[href="/login"][data-auth="public"]');
        if (user && loginLink) {
            loginLink.textContent = 'Dashboard';
            loginLink.href = window.EMCP.session.getDashboardForRole(user.role);
        }

        document.querySelectorAll('a[data-auth="required"]').forEach((a) => {
            if (!user) {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    toast('Please log in to continue.', 'warning');
                    window.location.href = '/login?msg=' + encodeURIComponent('Please log in to continue.');
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await renderUpcoming();
        initHeaderLinks();

        const params = new URLSearchParams(window.location.search);
        const msg = params.get('msg');
        if (msg) toast(msg, 'info');
    });
})();
