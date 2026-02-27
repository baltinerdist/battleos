import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const port = process.env.PORT || 8080;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let pool: mysql.Pool;

async function initDb() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS meta (
        id VARCHAR(50) PRIMARY KEY,
        value TEXT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id INT PRIMARY KEY,
        name VARCHAR(255),
        color VARCHAR(50),
        warriorRank INT,
        createdAt BIGINT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS judges (
        id INT PRIMARY KEY,
        name VARCHAR(255)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reeves (
        id INT PRIMARY KEY,
        name VARCHAR(255)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id VARCHAR(50) PRIMARY KEY,
        data LONGTEXT
      )
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

app.get('/api/state', async (req, res) => {
  try {
    const [metaRows]: any = await pool.query('SELECT * FROM meta');
    const [participantRows]: any = await pool.query('SELECT * FROM participants');
    const [judgeRows]: any = await pool.query('SELECT * FROM judges');
    const [reeveRows]: any = await pool.query('SELECT * FROM reeves');
    const [tournamentRows]: any = await pool.query('SELECT * FROM tournaments');

    const meta: any = {};
    metaRows.forEach((row: any) => meta[row.id] = row.value);

    res.json({
      eventName: meta.eventName || 'Winter Siege 2024',
      eventDate: meta.eventDate || new Date().toISOString().split('T')[0],
      nextParticipantId: parseInt(meta.nextParticipantId) || 1,
      nextJudgeId: parseInt(meta.nextJudgeId) || 1,
      nextReeveId: parseInt(meta.nextReeveId) || 1,
      activeTournamentId: meta.activeTournamentId || null,
      lastUpdated: parseInt(meta.lastUpdated) || 0,
      participants: participantRows,
      judges: judgeRows,
      reeves: reeveRows,
      tournaments: tournamentRows.map((row: any) => JSON.parse(row.data))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

app.post('/api/meta', async (req, res) => {
  const { eventName, eventDate, nextParticipantId, nextJudgeId, nextReeveId, activeTournamentId, lastUpdated } = req.body;
  try {
    const updates = [
      ['eventName', eventName],
      ['eventDate', eventDate],
      ['nextParticipantId', nextParticipantId?.toString()],
      ['nextJudgeId', nextJudgeId?.toString()],
      ['nextReeveId', nextReeveId?.toString()],
      ['activeTournamentId', activeTournamentId],
      ['lastUpdated', lastUpdated?.toString()]
    ];

    for (const [id, value] of updates) {
      if (value !== undefined) {
        await pool.query('INSERT INTO meta (id, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', [id, value, value]);
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update meta' });
  }
});

app.post('/api/participants', async (req, res) => {
  const participants = Array.isArray(req.body) ? req.body : [req.body];
  try {
    for (const p of participants) {
      await pool.query(
        'INSERT INTO participants (id, name, color, warriorRank, createdAt) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, color = ?, warriorRank = ?',
        [p.id, p.name, p.color, p.warriorRank || 0, p.createdAt, p.name, p.color, p.warriorRank || 0]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save participants' });
  }
});

app.post('/api/tournaments', async (req, res) => {
  const tournaments = Array.isArray(req.body) ? req.body : [req.body];
  try {
    for (const t of tournaments) {
      const data = JSON.stringify(t);
      await pool.query(
        'INSERT INTO tournaments (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = ?',
        [t.id, data, data]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save tournaments' });
  }
});

app.post('/api/judges', async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  try {
    for (const item of items) {
      await pool.query('INSERT INTO judges (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?', [item.id, item.name, item.name]);
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/reeves', async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  try {
    for (const item of items) {
      await pool.query('INSERT INTO reeves (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?', [item.id, item.name, item.name]);
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`BattleOS Server listening on port ${port}`);
  });
});