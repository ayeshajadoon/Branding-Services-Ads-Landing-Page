const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3005;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files from current directory

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Change this to a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        path: '/'
    },
    name: 'sessionId' // Change the default connect.sid
}));

// Database setup
const db = new sqlite3.Database('form_submissions.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the form submissions database.');
});

// Create tables if they don't exist
db.serialize(() => {
    // Submissions table
    db.run(`CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        company TEXT NOT NULL,
        goals TEXT NOT NULL,
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // Check if admin user exists, if not create default admin
    db.get("SELECT * FROM admin_users WHERE username = 'admin'", [], async (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (!row) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run("INSERT INTO admin_users (username, password) VALUES (?, ?)", 
                ['admin', hashedPassword], 
                (err) => {
                    if (err) {
                        console.error('Error creating default admin:', err.message);
                    } else {
                        console.log('Default admin user created');
                    }
                }
            );
        }
    });
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM admin_users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Login error:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        req.session.authenticated = true;
        req.session.user = { id: user.id, username: user.username };
        
        res.json({ success: true });
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
    // Clear the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        
        // Clear the session cookie
        res.clearCookie('sessionId', {
            httpOnly: true,
            path: '/'
        });
        
        // Send success response
        res.json({ success: true });
    });
});

// Add a check-auth endpoint
app.get('/check-auth', (req, res) => {
    res.json({ 
        authenticated: req.session && req.session.authenticated,
        user: req.session ? req.session.user : null
    });
});

// Form submission endpoint
app.post('/submit-form', (req, res) => {
    console.log('Received form submission:', req.body);
    const { firstName, lastName, email, phone, company, goals } = req.body;
    
    if (!firstName || !lastName || !email || !phone || !company || !goals) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = `INSERT INTO submissions (first_name, last_name, email, phone, company, goals)
                 VALUES (?, ?, ?, ?, ?, ?)`;
                 
    db.run(sql, [firstName, lastName, email, phone, company, goals], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Failed to submit form' });
            return;
        }
        console.log('Form submitted successfully');
        res.json({ success: true, message: 'Form submitted successfully' });
    });
});

// Get all submissions endpoint (protected)
app.get('/api/submissions', requireAuth, (req, res) => {
    db.all('SELECT * FROM submissions ORDER BY submission_date DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching submissions:', err.message);
            res.status(500).json({ error: 'Failed to fetch submissions' });
            return;
        }
        res.json(rows);
    });
});

// Serve login page
app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/admin');
    } else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
});

// Serve admin dashboard (protected)
app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 