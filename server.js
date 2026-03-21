const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === Password hashing with built-in crypto (no bcrypt dependency) ===
function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const result = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(result, 'hex'), Buffer.from(hash, 'hex'));
}

// === Initialize database ===
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_state (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      state JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Database initialized');
}

// === Auth middleware ===
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE token = $1', [token]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid token' });
    req.user = result.rows[0];
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth failed' });
  }
}

// === Signup ===
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const { salt, hash } = hashPassword(password);
    const token = crypto.randomBytes(32).toString('hex');

    const result = await pool.query(
      `INSERT INTO users (email, name, password_hash, password_salt, token)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name`,
      [email.toLowerCase().trim(), name.trim(), hash, salt, token]
    );

    res.json({ user: result.rows[0], token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// === Login ===
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, name, password_hash, password_salt, token FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_salt, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token: user.token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// === Get user state ===
app.get('/api/state', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT state FROM user_state WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0].state);
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error('Error loading state:', err);
    res.status(500).json({ error: 'Failed to load state' });
  }
});

// === Save user state ===
app.put('/api/state', authenticate, async (req, res) => {
  try {
    const state = req.body;
    await pool.query(
      `INSERT INTO user_state (user_id, state, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET state = $2, updated_at = NOW()`,
      [req.user.id, JSON.stringify(state)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Error saving state:', err);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Egg Diet Tracker running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
