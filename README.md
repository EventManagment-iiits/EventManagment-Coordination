# 🎓 Event Management & Coordination Platform (EMCP)

> A full-stack web application for planning, coordinating, and managing college-level events — from venue booking and resource allocation to student registration and volunteer task management.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Role-Based Access Control](#-role-based-access-control)
- [Features by Role](#-features-by-role)
- [Data Model](#-data-model)
- [Demo Accounts](#-demo-accounts)
- [Future Enhancements](#-future-enhancements)

---

## 🌐 Overview

The **Event Management & Coordination Platform** addresses the challenges of organizing campus events through disconnected tools and manual processes. It provides a centralized hub that:

- **Eliminates scheduling conflicts** via venue availability validation
- **Automates registration workflows** with real-time capacity tracking
- **Streamlines volunteer coordination** through task assignment and shift management
- **Enforces role-based access** ensuring each user sees only what they need

---

## 🏛️ Architecture

```
┌─────────────────────────────┐     HTTP (REST)     ┌─────────────────────────────┐
│                             │ ──────────────────▶  │                             │
│   Frontend (Port 3000)      │                      │   Backend (Port 3001)       │
│   EJS + Vanilla JS          │ ◀──────────────────  │   NestJS + TypeScript       │
│   Express Static Server     │     JSON Responses   │   In-Memory Data Store      │
│                             │                      │   Swagger @ /api/docs       │
└─────────────────────────────┘                      └─────────────────────────────┘
```

| Layer | Responsibility |
|---|---|
| **Frontend** | Server-side rendered EJS templates, client-side JS with async `fetch()` API calls |
| **Backend** | RESTful API with modular NestJS architecture, DTO validation, RBAC guards |
| **Data** | In-memory arrays (no external DB required). Data resets on server restart |
| **Auth** | Role passed via `x-user-role` HTTP header. No JWT/session — stateless RBAC |

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Backend Framework** | [NestJS](https://nestjs.com/) (Node.js + TypeScript) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Templating** | EJS (Embedded JavaScript) |
| **Frontend Server** | Express.js (static serving + routing) |
| **Validation** | `class-validator` + `class-transformer` (DTOs) |
| **API Documentation** | Swagger / OpenAPI 3.0 (`@nestjs/swagger`) |
| **Authorization** | Custom NestJS Guards + Decorators (RBAC) |
| **Data Storage** | In-Memory (Arrays / Objects) |

---

## 📁 Project Structure

```
root/
├── front-end/                      # Client application
│   ├── css/                        # Stylesheets
│   ├── js/
│   │   ├── core/                   # Shared utilities (UI, validators, RBAC, session, guard)
│   │   ├── data/                   # API client layer (repo.js) + seed stub
│   │   └── pages/                  # Page-specific logic (login, dashboards, signup)
│   ├── assets/                     # Static assets (images, icons)
│   ├── *.ejs                       # Page templates
│   ├── server.js                   # Express server (port 3000)
│   └── package.json
│
├── back-end/                       # NestJS API server
│   ├── src/
│   │   ├── common/                 # Cross-cutting concerns
│   │   │   ├── constants/          # Role enum
│   │   │   ├── decorators/         # @Roles() decorator
│   │   │   └── guards/             # RolesGuard
│   │   ├── users/                  # Users module (entities, DTOs, service, controller)
│   │   ├── venues/                 # Venues module
│   │   ├── resources/              # Resources module
│   │   ├── events/                 # Events module
│   │   ├── registrations/          # Registrations module
│   │   ├── attendance/             # Attendance module
│   │   ├── event-staff/            # Event Staff module
│   │   ├── event-resources/        # Event Resources module
│   │   ├── notifications/          # Notifications module
│   │   ├── seed/                   # SeedService (populates demo data on bootstrap)
│   │   ├── app.module.ts           # Root module
│   │   └── main.ts                 # Entry point (CORS, Swagger, ValidationPipe)
│   ├── docs/
│   │   └── swagger.json            # Exported OpenAPI specification
│   └── package.json
│
├── Database/                       # ER diagrams & schema design
├── Documentation/                  # Project documentation
├── Domain Expert Interaction/      # Domain research & expert interviews
├── Figma Designs/                  # UI/UX design mockups
├── Project Management/             # Sprint plans & task boards
├── definations.yml                 # API definitions (YAML)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/EventManagment-iiits/EventManagment-Coordination.git
cd EventManagment-Coordination

# Install backend dependencies
cd back-end
npm install

# Install frontend dependencies
cd ../front-end
npm install
```

### Running the Application

Open **two terminals**:

```bash
# Terminal 1 — Start the Backend (port 3001)
cd back-end
npm run start:dev
```

```bash
# Terminal 2 — Start the Frontend (port 3000)
cd front-end
node server.js
```

### Access Points

| Service | URL |
|---|---|
| 🌐 Frontend | [http://localhost:3000](http://localhost:3000) |
| 🔌 API Base | [http://localhost:3001/api](http://localhost:3001/api) |
| 📚 Swagger Docs | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) |

---

## 📚 API Documentation

The backend auto-generates interactive API documentation using **Swagger (OpenAPI 3.0)**.

- **Interactive UI**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **JSON Spec**: [http://localhost:3001/api/docs-json](http://localhost:3001/api/docs-json)
- **Exported Spec**: [`back-end/docs/swagger.json`](back-end/docs/swagger.json)

### API Modules (41 Endpoints)

| Module | Endpoints | Description |
|---|---|---|
| **Users** | 7 | Login, Signup, CRUD operations |
| **Venues** | 5 | Campus venue management |
| **Resources** | 5 | Shared resource inventory |
| **Events** | 7 | Event lifecycle management |
| **Registrations** | 5 | Student event registrations |
| **Attendance** | 2 | Attendance marking |
| **Event Staff** | 4 | Volunteer task assignments |
| **Event Resources** | 4 | Resource allocation per event |
| **Notifications** | 2 | In-app notification system |

### Request Headers

| Header | Purpose | Example |
|---|---|---|
| `x-user-role` | Role-based access control | `ADMIN`, `ORGANIZER`, `ATTENDEE` |
| `x-user-id` | User identification for scoped queries | `u3` |
| `Content-Type` | Request body format | `application/json` |

---

## 🔐 Role-Based Access Control

Authorization is enforced via a **custom NestJS Guard** that reads the `x-user-role` header on every request.

| Role | Access Level |
|---|---|
| `SUPER_USER` | Full system access — manage all users, events, venues, resources, and registrations |
| `ADMIN` | Manage venues and resource inventory |
| `ORGANIZER` | Create/manage own events, assign volunteers, allocate resources, view registrations |
| `ATTENDEE` | Browse events, register/unregister, view event details |
| `STAFF` | View assigned tasks, update task status, manage shift progress |

---

## ✨ Features by Role

### 🔑 Super User
- Platform-wide dashboard with aggregate statistics
- Full CRUD on users, venues, resources, events, and registrations
- User role and status management

### 🏢 Admin
- Venue management (add, edit, delete, set status)
- Resource inventory management (track quantities)

### 📋 Organizer
- Create and manage events with venue and capacity validation
- View registrations per event
- Assign volunteers with shift times and task roles
- Allocate shared resources to events

### 🎓 Attendee
- Browse upcoming and past events
- Register / unregister with real-time capacity checks ("House Full" enforcement)
- View event details and personal registration history

### 🤝 Staff (Volunteer)
- Dashboard with task statistics and upcoming shifts
- Update task status (ASSIGNED → IN_PROGRESS → DONE)
- View notifications for new assignments

---

## 🗃️ Data Model

The platform manages the following entities with relational constraints:

```
┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Users   │────▶│  Events  │────▶│ Registrations│
└──────────┘     └──────────┘     └──────────────┘
                      │                   │
                      │                   ▼
                      │            ┌──────────────┐
                      │            │  Attendance   │
                      │            └──────────────┘
                      │
                 ┌────┴────┐
                 │         │
           ┌─────────┐  ┌──────────────┐
           │  Event   │  │    Event     │
           │  Staff   │  │  Resources   │
           └─────────┘  └──────────────┘
                              │
                         ┌────┴────┐
                         │Resources│
                         └─────────┘

┌──────────┐     ┌───────────────┐
│  Venues  │     │ Notifications │
└──────────┘     └───────────────┘
```

| Entity | Key Fields |
|---|---|
| **User** | id, name, email, password, role, status, orgDept |
| **Venue** | id, venueName, location, capacity, status |
| **Resource** | id, resourceName, quantity |
| **Event** | id, title, description, eventDate, startTime, endTime, capacity, organizerId, venueId |
| **Registration** | id, userId, eventId, status, registrationDate |
| **Attendance** | id, registrationId, status, attendanceTime |
| **EventStaff** | id, eventId, staffId, role, shiftStart, shiftEnd, status |
| **EventResource** | id, eventId, resourceId, quantityUsed |
| **Notification** | id, userId, title, message, type, createdAt |

---

## 🧪 Demo Accounts

The backend seeds demo data on startup. Use any of these accounts to explore:

| Role | Email | Password |
|---|---|---|
| 🔑 Super User | `super@emcp.io` | `password123` |
| 🏢 Admin | `admin@emcp.io` | `password123` |
| 📋 Organizer | `organizer@emcp.io` | `password123` |
| 🎓 Attendee | `attendee@emcp.io` | `password123` |
| 🤝 Staff | `staff@emcp.io` | `password123` |

---

## 🔮 Future Enhancements

- Integration with institutional databases for automatic student verification
- JWT-based authentication with session management
- Automated certificate generation for workshop participants
- Mobile application with QR code-based attendance marking
- Email notifications for registration confirmations
- Post-event analytics and reporting dashboard
- External database integration (PostgreSQL / MongoDB)

---

## 📄 License

This project is developed as part of the **Full Stack Software Development (FFSD)** coursework at **IIIT Sri City**.
