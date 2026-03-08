-- ==========================================
-- Event Management & Coordination Platform
-- Database Schema
-- ==========================================

-- Create Database
CREATE DATABASE IF NOT EXISTS EMCP;
USE EMCP;

-- ==========================================
-- Users Table
-- ==========================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Venues Table
-- ==========================================
CREATE TABLE venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_name VARCHAR(150) NOT NULL,
    location VARCHAR(200),
    capacity INT NOT NULL
);

-- ==========================================
-- Events Table
-- ==========================================
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    capacity INT NOT NULL,
    organizer_id INT NOT NULL,
    venue_id INT NOT NULL,

    CONSTRAINT fk_event_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_event_venue
        FOREIGN KEY (venue_id)
        REFERENCES venues(venue_id)
        ON DELETE CASCADE
);

-- ==========================================
-- Registrations Table
-- ==========================================
CREATE TABLE registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),

    CONSTRAINT fk_registration_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_registration_event
        FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON DELETE CASCADE
);

-- ==========================================
-- Attendance Table
-- ==========================================
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    attendance_time TIMESTAMP,
    status VARCHAR(50),

    CONSTRAINT fk_attendance_registration
        FOREIGN KEY (registration_id)
        REFERENCES registrations(registration_id)
        ON DELETE CASCADE
);

-- ==========================================
-- Event Staff Table
-- ==========================================
CREATE TABLE event_staff (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    staff_id INT NOT NULL,
    role VARCHAR(100),

    CONSTRAINT fk_eventstaff_event
        FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_eventstaff_user
        FOREIGN KEY (staff_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================================
-- Resources Table
-- ==========================================
CREATE TABLE resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL
);

-- ==========================================
-- Event Resources Table
-- ==========================================
CREATE TABLE event_resources (
    event_resource_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity_used INT NOT NULL,

    CONSTRAINT fk_eventresource_event
        FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_eventresource_resource
        FOREIGN KEY (resource_id)
        REFERENCES resources(resource_id)
        ON DELETE CASCADE
);