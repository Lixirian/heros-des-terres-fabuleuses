import { Router, Response } from 'express';
import { getDb } from '../db/schema';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Get progress for a character's book
router.get('/:characterId/:bookNumber', (req: AuthRequest, res: Response) => {
  const db = getDb();
  // Verify ownership
  const char = db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(req.params.characterId, req.userId!);
  if (!char) return res.status(404).json({ error: 'Personnage introuvable' });

  const progress = db.prepare(
    'SELECT * FROM book_progress WHERE character_id = ? AND book_number = ? ORDER BY code_number'
  ).all(req.params.characterId, req.params.bookNumber);

  res.json(progress);
});

// Toggle code visited
router.post('/:characterId/:bookNumber/:codeNumber', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const char = db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(req.params.characterId, req.userId!);
  if (!char) return res.status(404).json({ error: 'Personnage introuvable' });

  const { characterId, bookNumber, codeNumber } = req.params;
  const { notes } = req.body;

  const existing = db.prepare(
    'SELECT * FROM book_progress WHERE character_id = ? AND book_number = ? AND code_number = ?'
  ).get(characterId, bookNumber, codeNumber) as any;

  if (existing) {
    if (notes !== undefined) {
      db.prepare('UPDATE book_progress SET notes = ? WHERE id = ?').run(notes, existing.id);
    } else {
      db.prepare('DELETE FROM book_progress WHERE id = ?').run(existing.id);
    }
  } else {
    db.prepare(
      'INSERT INTO book_progress (character_id, book_number, code_number, notes) VALUES (?, ?, ?, ?)'
    ).run(characterId, bookNumber, codeNumber, notes ?? '');
  }

  const progress = db.prepare(
    'SELECT * FROM book_progress WHERE character_id = ? AND book_number = ? ORDER BY code_number'
  ).all(characterId, bookNumber);

  res.json(progress);
});

// Save combat log
router.post('/combat-log/:characterId', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const char = db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(req.params.characterId, req.userId!);
  if (!char) return res.status(404).json({ error: 'Personnage introuvable' });

  const { enemy_name, enemy_defence, enemy_stamina, result, rounds } = req.body;

  db.prepare(`
    INSERT INTO combat_log (character_id, enemy_name, enemy_defence, enemy_stamina, result, rounds)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.characterId, enemy_name, enemy_defence, enemy_stamina, result, JSON.stringify(rounds ?? []));

  res.status(201).json({ success: true });
});

// Get combat logs
router.get('/combat-log/:characterId', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const char = db.prepare('SELECT id FROM characters WHERE id = ? AND user_id = ?').get(req.params.characterId, req.userId!);
  if (!char) return res.status(404).json({ error: 'Personnage introuvable' });

  const logs = db.prepare(
    'SELECT * FROM combat_log WHERE character_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.params.characterId);

  res.json(logs);
});

export default router;
