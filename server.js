const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_state (
      user_id TEXT PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Database initialized');
}

// Get user state
app.get('/api/state/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT state FROM user_state WHERE user_id = $1',
      [userId.toLowerCase().trim()]
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

// Save user state
app.put('/api/state/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const state = req.body;
    await pool.query(
      `INSERT INTO user_state (user_id, state, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET state = $2, updated_at = NOW()`,
      [userId.toLowerCase().trim(), JSON.stringify(state)]
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
