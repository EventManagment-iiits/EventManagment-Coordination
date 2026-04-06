# EMCP — Event Management & Coordination Platform (Front-End)

A fully functional front-end prototype for an institutional event management system, built with **vanilla HTML, CSS, and JavaScript**. The application demonstrates role-based access control, full CRUD operations, client-side form validation, and modular code architecture — all powered by `localStorage` for data persistence.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start

# 3. Open in browser
# → http://localhost:3000
```

---

## Demo Accounts

| Role         | Email               | Password      |
|-------------|---------------------|---------------|
| Super User  | super@emcp.io       | password123   |
| Admin       | admin@emcp.io       | password123   |
| Organizer   | organizer@emcp.io   | password123   |
| Attendee    | attendee@emcp.io    | password123   |
| Staff       | staff@emcp.io       | password123   |

> Mock data is auto-seeded on first load. To reset, clear `localStorage` and refresh.

---

## Architecture

```
front-end/
├── css/
│   └── style.css              ← Complete design system (CSS variables, responsive)
├── js/
│   ├── core/                  ← Framework modules
│   │   ├── constants.js       ← Roles, storage keys, route mapping
│   │   ├── guard.js           ← Route protection, sidebar nav, mobile toggle
│   │   ├── rbac.js            ← Role-based access control policy
│   │   ├── session.js         ← Session management (sessionStorage)
│   │   ├── ui.js              ← Toast, modal, form helpers, escapeHtml
│   │   └── validators.js      ← Composable validation functions
│   ├── data/                  ← Data layer
│   │   ├── repo.js            ← Full CRUD repository (localStorage)
│   │   └── seed.js            ← Mock data seeding with versioning
│   └── pages/                 ← Page-specific logic (one file per dashboard)
│       ├── admin.js
│       ├── attendee.js
│       ├── landing.js
│       ├── login.js
│       ├── organizer.js
│       ├── signup-organizer.js
│       ├── signup-attendee.js
│       ├── signup-staff.js
│       ├── staff.js
│       └── super-user.js
├── *.ejs                      ← View templates (10 pages)
├── 404.ejs                    ← Custom error page
├── server.js                  ← Express dev server (serves EJS + static files)
└── package.json
```

---

## Roles & Permissions

| Role        | Access Scope                                                  |
|------------|---------------------------------------------------------------|
| Super User | Full CRUD on all modules: Users, Venues, Resources, Events, Registrations |
| Admin      | CRUD on Venues and Resources only (operational scope)         |
| Organizer  | CRUD on own Events, Staff assignments, Resource allocations   |
| Attendee   | Browse events, register/unregister, view own registrations    |
| Staff      | View assigned tasks, update task status, receive notifications|

RBAC is enforced at two levels:
1. **Route-level** — `guard.js` redirects unauthorized users
2. **Action-level** — `rbac.js` checks `can(role, action, resource)` before CRUD operations

---

## Key Features

- **No external CSS/JS frameworks** — 100% vanilla implementation
- **Responsive design** — Works on desktop, tablet, and mobile with collapsible sidebar
- **XSS prevention** — `escapeHtml()` used on all dynamic content
- **Cascade deletes** — Deleting a user removes their events, registrations, and assignments
- **Client-side validation** — Composable validators with per-field error messages
- **Toast notifications** — Success, danger, warning, info feedback
- **Empty state handling** — Graceful messages when no data exists

---

## Tech Stack

| Component    | Technology           |
|-------------|---------------------|
| Structure   | HTML (EJS templates) |
| Styling     | Vanilla CSS          |
| Logic       | Vanilla JavaScript   |
| Dev Server  | Express.js + EJS     |
| Data        | localStorage         |
| Auth State  | sessionStorage       |

> Express + EJS are used **only** as a lightweight dev server. No server-side data processing occurs — all logic runs client-side.

---

## License

This project was developed as part of the Full Stack Software Development coursework at **IIIT Sri City**.
