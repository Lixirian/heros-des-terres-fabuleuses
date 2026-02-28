import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/htf.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    migrate(db);
  }
  return db;
}

function migrate(db: Database.Database) {
  // Ajout des colonnes pour résurrection, initiation et mort (v2)
  const cols = db.prepare("PRAGMA table_info(characters)").all() as { name: string }[];
  const colNames = cols.map(c => c.name);
  if (!colNames.includes('is_initiate')) {
    db.exec("ALTER TABLE characters ADD COLUMN is_initiate BOOLEAN DEFAULT 0");
  }
  if (!colNames.includes('resurrection_arrangement')) {
    db.exec("ALTER TABLE characters ADD COLUMN resurrection_arrangement TEXT");
  }
  if (!colNames.includes('is_dead')) {
    db.exec("ALTER TABLE characters ADD COLUMN is_dead BOOLEAN DEFAULT 0");
  }
  if (!colNames.includes('temp_bonuses')) {
    db.exec("ALTER TABLE characters ADD COLUMN temp_bonuses TEXT DEFAULT '{}'");
  }
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      profession TEXT NOT NULL,
      rank INTEGER DEFAULT 1,
      stamina INTEGER DEFAULT 9,
      max_stamina INTEGER DEFAULT 9,
      defence INTEGER DEFAULT 4,
      money INTEGER DEFAULT 16,
      charisma INTEGER DEFAULT 1,
      combat INTEGER DEFAULT 1,
      magic INTEGER DEFAULT 1,
      sanctity INTEGER DEFAULT 1,
      scouting INTEGER DEFAULT 1,
      thievery INTEGER DEFAULT 1,
      god TEXT,
      blessings TEXT DEFAULT '[]',
      titles TEXT DEFAULT '[]',
      equipment TEXT DEFAULT '[]',
      codewords TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      is_pregen BOOLEAN DEFAULT 0,
      pregen_id TEXT,
      portrait TEXT,
      backstory TEXT,
      is_initiate BOOLEAN DEFAULT 0,
      resurrection_arrangement TEXT,
      is_dead BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS book_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
      book_number INTEGER NOT NULL,
      code_number INTEGER NOT NULL,
      visited BOOLEAN DEFAULT 1,
      notes TEXT DEFAULT '',
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(character_id, book_number, code_number)
    );

    CREATE TABLE IF NOT EXISTS combat_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
      enemy_name TEXT,
      enemy_defence INTEGER,
      enemy_stamina INTEGER,
      result TEXT,
      rounds TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default getDb;
