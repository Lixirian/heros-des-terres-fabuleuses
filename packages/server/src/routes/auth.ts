import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/schema';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    return res.status(409).json({ error: 'Ce pseudo ou email est déjà utilisé' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, hash);

  const token = generateToken(result.lastInsertRowid as number);
  res.status(201).json({ token, user: { id: result.lastInsertRowid, username, email } });
});

router.post('/login', (req: Request, res: Response) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const db = getDb();
  const userId = (req as AuthRequest).userId!;
  const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(userId) as any;
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json(user);
});

export default router;
