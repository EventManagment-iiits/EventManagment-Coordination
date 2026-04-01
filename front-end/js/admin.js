const AdminModule = {
    init: function() {
        this.renderTable();
        this.bindEvents();
    },

    renderTable: function() {
        const users = db.getUsers();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No users found.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td><span class="status-badge" style="background:#e0e7ff; color:#3730a3">${user.role}</span></td>
                <td><span class="status-badge status-active">${user.status}</span></td>
                <td>
                    <button class="action-btn" onclick="AdminModule.editUser('${user.id}')">Edit</button>
                    <button class="action-btn delete" onclick="AdminModule.deleteUser('${user.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    bindEvents: function() {
        // Modal Controls
        document.getElementById('add-user-btn').addEventListener('click', () => {
            document.getElementById('crud-form').reset();
            document.getElementById('user-id').value = '';
            document.getElementById('modal-title').innerText = 'Add New User';
            document.getElementById('crud-modal').classList.remove('hidden');
        });

        document.getElementById('cancel-modal').addEventListener('click', () => {
            document.getElementById('crud-modal').classList.add('hidden');
        });

        // Form Submit for Add/Edit
        document.getElementById('crud-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });
    },

    saveUser: function() {
        const id = document.getElementById('user-id').value;
        const name = document.getElementById('user-name').value;
        const email = document.getElementById('user-email').value;
        const role = document.getElementById('user-role').value;

        // Validation
        if (!name.trim() || !email.trim()) {
            alert("Name and email are required.");
            return;
        }

        let users = db.getUsers();

        if (id) {
            // Update existing (U in CRUD)
            const index = users.findIndex(u => u.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], name, email, role };
            }
        } else {
            // Create new (C in CRUD)
            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                role,
                status: 'Active'
            };
            users.push(newUser);
        }

        db.saveUsers(users);
        document.getElementById('crud-modal').classList.add('hidden');
        this.renderTable(); // Re-render without page reload
    },

    editUser: function(id) {
        const user = db.getUsers().find(u => u.id === id);
        if(!user) return;

        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        
        document.getElementById('modal-title').innerText = 'Edit User';
        document.getElementById('crud-modal').classList.remove('hidden');
    },

    deleteUser: function(id) {
        // D in CRUD
        if(confirm("Are you sure you want to delete this user?")) {
            let users = db.getUsers();
            users = users.filter(u => u.id !== id);
            db.saveUsers(users);
            this.renderTable(); // Re-render without page reload
        }
    }
};