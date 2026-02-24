import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import characterRoutes from './routes/characters';
import bookRoutes from './routes/books';

const app = express();
const PORT = process.env.PORT || 46127;

app.use(cors());
app.use(express.json());

// Serve uploaded files (portraits, etc.)
const dataDir = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : './data';
app.use('/uploads', express.static(path.join(dataDir)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/books', bookRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🏰 Héros des Terres Fabuleuses - Serveur démarré sur le port ${PORT}`);
});

export default app;
