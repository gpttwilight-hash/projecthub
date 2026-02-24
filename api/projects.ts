import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client';

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL not set');
  return createClient({ url, authToken });
}

async function ensureTable(db: ReturnType<typeof createClient>) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getDb();
  await ensureTable(db);

  try {
    // GET — list all projects
    if (req.method === 'GET') {
      const result = await db.execute(
        'SELECT data FROM projects ORDER BY updated_at DESC'
      );
      const projects = result.rows.map(r => JSON.parse(r.data as string));
      return res.json(projects);
    }

    // POST — create project
    if (req.method === 'POST') {
      const project = req.body;
      await db.execute({
        sql: 'INSERT INTO projects (id, data, updated_at) VALUES (?, ?, ?)',
        args: [project.id, JSON.stringify(project), project.updatedAt],
      });
      return res.json(project);
    }

    // PUT — update project
    if (req.method === 'PUT') {
      const project = req.body;
      await db.execute({
        sql: 'UPDATE projects SET data = ?, updated_at = ? WHERE id = ?',
        args: [JSON.stringify(project), project.updatedAt, project.id],
      });
      return res.json(project);
    }

    // DELETE — remove project
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id as string] });
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
