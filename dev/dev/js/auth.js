// Authentication functionality for agame.works
// Note: This is a client-side demo. In production, use proper server-side authentication

const Auth = {
    // Configuration
    HOME_URL: 'index.html',
    
    // Default admin credentials (in production, this would be server-side)
    defaultAdmin: {
        username: 'admin',
        password: 'admin123',
        role: 'admin'
    },

    // Simple hash function for password obfuscation
    // Note: In production, use bcrypt or similar on the server-side
    hashPassword: function(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'h_' + Math.abs(hash).toString(16);
    },

    // Initialize authentication system
    init: function() {
        // Create default admin if no users exist
        if (!this.getUsers().length) {
            this.createUser(this.defaultAdmin.username, this.defaultAdmin.password, this.defaultAdmin.role);
        }
        this.updateAuthUI();
    },

    // Get all users from localStorage
    getUsers: function() {
        const users = localStorage.getItem('agame_users');
        return users ? JSON.parse(users) : [];
    },

    // Save users to localStorage
    saveUsers: function(users) {
        localStorage.setItem('agame_users', JSON.stringify(users));
    },

    // Create a new user (role defaults to 'user')
    createUser: function(username, password, role = 'user') {
        const users = this.getUsers();
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }

        const newUser = {
            id: Date.now(),
            username: username,
            passwordHash: this.hashPassword(password),
            role: role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        return { success: true, message: 'User created successfully' };
    },

    // Login user
    login: function(username, password) {
        const users = this.getUsers();
        const hashedPassword = this.hashPassword(password);
        const user = users.find(u => u.username === username && u.passwordHash === hashedPassword);
        
        if (user) {
            const session = {
                id: user.id,
                username: user.username,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('agame_session', JSON.stringify(session));
            this.updateAuthUI();
            return { success: true, user: session };
        }
        
        return { success: false, message: 'Invalid username or password' };
    },

    // Logout user
    logout: function() {
        localStorage.removeItem('agame_session');
        this.updateAuthUI();
        window.location.href = this.HOME_URL;
    },

    // Get current session
    getSession: function() {
        const session = localStorage.getItem('agame_session');
        return session ? JSON.parse(session) : null;
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return this.getSession() !== null;
    },

    // Check if user is admin
    isAdmin: function() {
        const session = this.getSession();
        return session && session.role === 'admin';
    },

    // Update UI based on authentication state
    updateAuthUI: function() {
        const authButtons = document.querySelector('.auth-buttons');
        
        if (authButtons) {
            if (this.isLoggedIn()) {
                const session = this.getSession();
                
                // Create elements properly to avoid inline handlers
                const welcomeSpan = document.createElement('span');
                welcomeSpan.style.marginRight = '1rem';
                welcomeSpan.textContent = 'Welcome, ' + session.username;
                
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'signup-btn';
                logoutBtn.textContent = 'Logout';
                logoutBtn.addEventListener('click', () => Auth.logout());
                
                authButtons.innerHTML = '';
                authButtons.appendChild(welcomeSpan);
                
                if (this.isAdmin()) {
                    const adminLink = document.createElement('a');
                    adminLink.href = 'admin.html';
                    adminLink.className = 'login-btn';
                    adminLink.textContent = 'Admin Panel';
                    authButtons.appendChild(adminLink);
                }
                
                authButtons.appendChild(logoutBtn);
            } else {
                authButtons.innerHTML = `
                    <a href="login.html" class="login-btn">Login</a>
                    <a href="signup.html" class="signup-btn">Sign Up</a>
                `;
            }
        }
    },

    // Delete user (admin only)
    deleteUser: function(userId) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Unauthorized' };
        }

        let users = this.getUsers();
        users = users.filter(u => u.id !== userId);
        this.saveUsers(users);
        return { success: true, message: 'User deleted' };
    },

    // Get all users (admin only)
    getAllUsers: function() {
        if (!this.isAdmin()) {
            return [];
        }
        return this.getUsers().map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            createdAt: u.createdAt
        }));
    }
};

// Contact form messages storage
const Messages = {
    getMessages: function() {
        const messages = localStorage.getItem('agame_messages');
        return messages ? JSON.parse(messages) : [];
    },

    saveMessage: function(name, email, message) {
        const messages = this.getMessages();
        messages.push({
            id: Date.now(),
            name: name,
            email: email,
            message: message,
            createdAt: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('agame_messages', JSON.stringify(messages));
        return { success: true };
    },

    deleteMessage: function(id) {
        let messages = this.getMessages();
        messages = messages.filter(m => m.id !== id);
        localStorage.setItem('agame_messages', JSON.stringify(messages));
    },

    markAsRead: function(id) {
        const messages = this.getMessages();
        const message = messages.find(m => m.id === id);
        if (message) {
            message.read = true;
            localStorage.setItem('agame_messages', JSON.stringify(messages));
        }
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});
