const Auth = {
    login: function(email, password) {
        // Validation Edge Cases
        if (!email || !password) return { success: false, msg: "All fields are required." };
        if (password.length < 6) return { success: false, msg: "Password must be at least 6 characters." };

        const user = db.getUserByEmail(email);
        
        // Simulating auth check (In a real app, passwords would be hashed)
        if (user && password === "password123") {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user: user };
        }
        return { success: false, msg: "Invalid credentials. Try admin@emcp.io and password123" };
    },

    logout: function() {
        sessionStorage.removeItem('currentUser');
        window.location.reload(); // Quick reset to initial state
    },

    getCurrentUser: function() {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    }
};