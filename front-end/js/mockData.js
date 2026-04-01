// Initial Mock Data Setup
const initialUsers = [
    { id: '1', name: 'Alex Morgan', email: 'admin@emcp.io', role: 'Admin', status: 'Active' },
    { id: '2', name: 'David Chen', email: 'david.c@university.edu', role: 'Organizer', status: 'Active' },
    { id: '3', name: 'Sarah Jenkins', email: 's.jenkins@mail.com', role: 'Attendee', status: 'Active' }
];

// Initialize database if empty
function initDB() {
    if (!localStorage.getItem('emcp_users')) {
        localStorage.setItem('emcp_users', JSON.stringify(initialUsers));
    }
}

// Data Utility Functions
const db = {
    getUsers: () => JSON.parse(localStorage.getItem('emcp_users')),
    saveUsers: (users) => localStorage.setItem('emcp_users', JSON.stringify(users)),
    getUserByEmail: (email) => db.getUsers().find(u => u.email === email)
};

initDB();