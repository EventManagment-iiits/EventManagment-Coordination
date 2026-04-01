document.addEventListener('DOMContentLoaded', () => {
    
    const loginView = document.getElementById('login-view');
    const adminView = document.getElementById('admin-view');
    const loginForm = document.getElementById('login-form');

    // Check if user is already logged in
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
        showDashboard(currentUser);
    }

    // Login Submission Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        
        // Reset Error Messages
        document.getElementById('email-error').innerText = '';
        document.getElementById('password-error').innerText = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const result = Auth.login(email, password);

        if (result.success) {
            showDashboard(result.user);
        } else {
            document.getElementById('password-error').innerText = result.msg;
        }
    });

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        Auth.logout();
    });

    // Navigation and View Switching Function
    function showDashboard(user) {
        // Ensure strictly Role-Based Rendering (Requirement #8)
        if (user.role !== 'Admin') {
            alert("Access Denied: Super Admin privileges required.");
            Auth.logout();
            return;
        }

        // Hide Login, Show Dashboard
        loginView.classList.remove('active');
        loginView.classList.add('hidden');
        adminView.classList.remove('hidden');
        adminView.classList.add('layout-dashboard');

        // Set UI info
        document.getElementById('current-user-name').innerText = user.name;

        // Initialize CRUD Module
        AdminModule.init();
    }
});