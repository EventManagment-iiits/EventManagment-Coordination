import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { VenuesService } from '../venues/venues.service';
import { ResourcesService } from '../resources/resources.service';
import { EventsService } from '../events/events.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { AttendanceService } from '../attendance/attendance.service';
import { EventStaffService } from '../event-staff/event-staff.service';
import { EventResourcesService } from '../event-resources/event-resources.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly venuesService: VenuesService,
    private readonly resourcesService: ResourcesService,
    private readonly eventsService: EventsService,
    private readonly registrationsService: RegistrationsService,
    private readonly attendanceService: AttendanceService,
    private readonly eventStaffService: EventStaffService,
    private readonly eventResourcesService: EventResourcesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.seed();
  }

  seed() {
    // --- Users ---
    this.usersService.users.push(
      { id: 'u1', name: 'Super User', email: 'super@emcp.io', password: 'password123', role: 'SUPER_USER', status: 'Active', orgDept: 'System', createdAt: new Date().toISOString() },
      { id: 'u2', name: 'Alex Rivera', email: 'admin@emcp.io', password: 'password123', role: 'ADMIN', status: 'Active', orgDept: 'Administration', createdAt: new Date().toISOString() },
      { id: 'u3', name: 'Alex Johnson', email: 'organizer@emcp.io', password: 'password123', role: 'ORGANIZER', status: 'Active', orgDept: 'Student Council', createdAt: new Date().toISOString() },
      { id: 'u4', name: 'Jamie Student', email: 'attendee@emcp.io', password: 'password123', role: 'ATTENDEE', status: 'Active', orgDept: 'CS Dept', createdAt: new Date().toISOString() },
      { id: 'u5', name: 'Sam Volunteer', email: 'staff@emcp.io', password: 'password123', role: 'STAFF', status: 'Active', orgDept: 'Volunteer Team', createdAt: new Date().toISOString() },
    );

    // --- Venues ---
    this.venuesService.venues.push(
      { id: 'v1', venueName: 'Grand Auditorium A', location: 'Main Campus, Building 4', capacity: 850, status: 'Active' },
      { id: 'v2', venueName: 'Seminar Hall 204', location: 'East Wing, Floor 2', capacity: 120, status: 'Under Maintenance' },
      { id: 'v3', venueName: 'Executive Lounge', location: 'Tower B, Penthouse', capacity: 45, status: 'Fully Booked' },
    );

    // --- Resources ---
    this.resourcesService.resources.push(
      { id: 'r1', resourceName: 'Projector', quantity: 12 },
      { id: 'r2', resourceName: 'Wireless Microphone', quantity: 20 },
      { id: 'r3', resourceName: 'Chairs', quantity: 500 },
    );

    // --- Events ---
    const today = new Date();
    const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
    const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

    this.eventsService.events.push(
      {
        id: 'e1',
        title: 'Tech Innovators Forum 2026',
        description: 'A day of discovery, networking, and hands-on demos.',
        imageUrl: '',
        eventDate: toIsoDate(d1),
        startTime: '09:00',
        endTime: '12:00',
        capacity: 249,
        organizerId: 'u3',
        venueId: 'v1',
      },
      {
        id: 'e2',
        title: 'Advanced UI/UX Workshop',
        description: 'Design systems, accessibility, and modern patterns.',
        imageUrl: '',
        eventDate: toIsoDate(d2),
        startTime: '14:00',
        endTime: '16:30',
        capacity: 120,
        organizerId: 'u3',
        venueId: 'v2',
      },
    );

    // --- Registrations ---
    this.registrationsService.registrations.push(
      { id: 'reg1', userId: 'u4', eventId: 'e1', status: 'CONFIRMED', registrationDate: new Date().toISOString() },
    );

    // --- Attendance ---
    this.attendanceService.attendance.push(
      { id: 'a1', registrationId: 'reg1', status: 'PENDING', attendanceTime: null },
    );

    // --- Event Staff ---
    this.eventStaffService.assignments.push(
      { id: 'as1', eventId: 'e1', staffId: 'u5', role: 'Main Stage Setup', shiftStart: '09:00', shiftEnd: '12:00', status: 'ASSIGNED' },
    );

    // --- Event Resources ---
    this.eventResourcesService.allocations.push(
      { id: 'er1', eventId: 'e1', resourceId: 'r1', quantityUsed: 2 },
    );

    // --- Notifications ---
    this.notificationsService.notifications.push(
      { id: 'n1', userId: 'u5', title: 'New task assigned!', message: 'You have been added to the Tech Innovators Forum 2026 support team.', type: 'info', createdAt: new Date().toISOString() },
    );

    console.log('✅ Database seeded with demo data.');
  }
}
