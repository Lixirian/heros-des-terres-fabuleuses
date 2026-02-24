import { Router, Request, Response } from 'express';
import { getDb } from '../db/schema';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// List user's characters
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const userId = (req as AuthRequest).userId!;
  const chars = db.prepare('SELECT * FROM characters WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
  res.json(chars);
});

// Get single character
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const userId = (req as AuthRequest).userId!;
  const char = db.prepare('SELECT * FROM characters WHERE id = ? AND user_id = ?').get(req.params.id, userId);
  if (!char) return res.status(404).json({ error: 'Personnage introuvable' });
  res.json(char);
});

// Create character
router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const userId = (req as AuthRequest).userId!;
  const {
    name, profession, rank, stamina, max_stamina, defence, money,
    charisma, combat, magic, sanctity, scouting, thievery,
    god, blessings, titles, equipment, codewords, notes,
    is_pregen, pregen_id, portrait, backstory,
    is_initiate, resurrection_arrangement
  } = req.body;

  if (!name || !profession) {
    return res.status(400).json({ error: 'Nom et profession requis' });
  }

  const result = db.prepare(`
    INSERT INTO characters (
      user_id, name, profession, rank, stamina, max_stamina, defence, money,
      charisma, combat, magic, sanctity, scouting, thievery,
      god, blessings, titles, equipment, codewords, notes,
      is_pregen, pregen_id, portrait, backstory,
      is_initiate, resurrection_arrangement
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId, name, profession,
    rank ?? 1, stamina ?? 9, max_stamina ?? 9, defence ?? 4, money ?? 16,
    charisma ?? 1, combat ?? 1, magic ?? 1, sanctity ?? 1, scouting ?? 1, thievery ?? 1,
    god ?? null,
    JSON.stringify(blessings ?? []),
    JSON.stringify(titles ?? []),
    JSON.stringify(equipment ?? []),
    JSON.stringify(codewords ?? []),
    notes ?? '',
    is_pregen ? 1 : 0, pregen_id ?? null,
    portrait ?? null, backstory ?? null,
    is_initiate ? 1 : 0, resurrection_arrangement ?? null
  );

  const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(char);
});

// Update character
router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const userId = (req as AuthRequest).userId!;
  const existing = db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(req.params.id, userId);
  if (!existing) return res.status(404).json({ error: 'Personnage introuvable' });

  const fields = [
    'name', 'profession', 'rank', 'stamina', 'max_stamina', 'defence', 'money',
    'charisma', 'combat', 'magic', 'sanctity', 'scouting', 'thievery',
    'god', 'notes', 'portrait', 'backstory',
    'is_initiate', 'resurrection_arrangement', 'is_dead'
  ];
  const jsonFields = ['blessings', 'titles', 'equipment', 'codewords'];

  const updates: string[] = [];
  const values: any[] = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  for (const f of jsonFields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(JSON.stringify(req.body[f]));
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'Rien à modifier' });

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id, userId);

  db.prepare(`UPDATE characters SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
  res.json(char);
});

// Delete character
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const userId = (req as AuthRequest).userId!;
  const result = db.prepare('DELETE FROM characters WHERE id = ? AND user_id = ?').run(req.params.id, userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Personnage introuvable' });
  res.json({ success: true });
});

export default router;
