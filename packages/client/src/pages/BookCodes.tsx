import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { books, getBook } from '../data/books';
import { codewords, codewordLetters } from '../data/codewords';

export default function BookCodes() {
  const { bookId } = useParams();
  const [selectedBook, setSelectedBook] = useState<number>(bookId ? Number(bookId) : 1);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<number | null>(null);
  const [checkedWords, setCheckedWords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const book = getBook(selectedBook);
  const words = codewords[selectedBook] || [];
  const letter = codewordLetters[selectedBook] || '?';

  useEffect(() => {
    api.getCharacters().then(setCharacters);
  }, []);

  // Charger les coche-mots cochés pour ce personnage et ce livre
  useEffect(() => {
    if (selectedCharId && selectedBook) {
      api.getBookProgress(selectedCharId, selectedBook).then(progress => {
        const checked = new Set<string>();
        progress.forEach((p: any) => {
          // On stocke le nom du coche-mot dans le champ notes, et code_number = index
          if (p.notes) checked.add(p.notes);
        });
        setCheckedWords(checked);
      });
    } else {
      setCheckedWords(new Set());
    }
  }, [selectedCharId, selectedBook]);

  const toggleWord = async (word: string) => {
    if (!selectedCharId) return;
    const index = words.indexOf(word);
    if (index === -1) return;

    // On utilise code_number = index+1 et notes = le mot
    const newChecked = new Set(checkedWords);
    if (newChecked.has(word)) {
      newChecked.delete(word);
      // Supprimer (toggle off)
      await api.toggleCode(selectedCharId, selectedBook, index + 1);
    } else {
      newChecked.add(word);
      // Ajouter avec le mot en notes
      await api.toggleCode(selectedCharId, selectedBook, index + 1, word);
    }
    setCheckedWords(newChecked);
  };

  const checkedCount = checkedWords.size;
  const totalWords = words.length;

  const filteredWords = searchTerm
    ? words.filter(w => w.toLowerCase().includes(searchTerm.toLowerCase()))
    : words;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Coche-mots</h2>

      {/* Book Selector */}
      <div className="flex flex-wrap gap-2">
        {books.map(b => (
          <button
            key={b.id}
            onClick={() => { setSelectedBook(b.id); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medieval text-sm transition-all border-2 ${
              selectedBook === b.id
                ? 'text-white shadow-lg border-white/30'
                : 'bg-parchment-800/50 text-parchment-300 hover:text-parchment-100 border-transparent hover:border-parchment-600'
            }`}
            style={selectedBook === b.id ? { backgroundColor: b.color } : {}}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: b.color, color: 'white' }}
            >
              {codewordLetters[b.id]}
            </span>
            <span className="hidden sm:inline">Livre {b.id}</span>
          </button>
        ))}
      </div>

      {book && (
        <div
          className="rounded-lg p-4 border-l-4"
          style={{
            borderLeftColor: book.color,
            background: `linear-gradient(135deg, ${book.color}15, ${book.colorAccent}10)`,
          }}
        >
          <h3 className="font-medieval text-xl text-parchment-100">
            Livre {book.id} : {book.titleFr}
          </h3>
          <p className="text-sm text-parchment-300 italic">{book.title}</p>
          <p className="text-parchment-400 text-xs mt-1">
            {totalWords} coche-mots (lettre {letter}) &mdash; {book.region}
          </p>
        </div>
      )}

      {/* Character Selector */}
      <div className="parchment-card">
        <h3 className="font-medieval text-lg text-fantasy-gold mb-3">Suivi par personnage</h3>
        <select
          value={selectedCharId ?? ''}
          onChange={e => setSelectedCharId(e.target.value ? Number(e.target.value) : null)}
          className="fantasy-input"
        >
          <option value="">Sélectionner un personnage</option>
          {characters.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name} ({c.profession})</option>
          ))}
        </select>

        {selectedCharId && (
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 bg-parchment-700/30 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${totalWords > 0 ? (checkedCount / totalWords) * 100 : 0}%`,
                  backgroundColor: book?.color ?? '#DAA520',
                }}
              />
            </div>
            <span className="text-sm text-parchment-300 font-semibold whitespace-nowrap">
              {checkedCount} / {totalWords}
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="parchment-card">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="fantasy-input"
          placeholder={`Rechercher un coche-mot (${letter}...)`}
        />
      </div>

      {/* Codewords Grid */}
      <div className="parchment-card">
        <h3 className="font-medieval text-lg text-fantasy-gold mb-4">
          Codes &mdash; Lettre {letter}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {filteredWords.map(word => {
            const isChecked = checkedWords.has(word);
            return (
              <button
                key={word}
                onClick={() => selectedCharId && toggleWord(word)}
                disabled={!selectedCharId}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left text-sm ${
                  isChecked
                    ? 'border-fantasy-gold/50 text-white'
                    : selectedCharId
                      ? 'border-parchment-600 text-parchment-300 hover:border-parchment-500 hover:text-parchment-100'
                      : 'border-parchment-700 text-parchment-500 cursor-not-allowed'
                }`}
                style={isChecked ? { backgroundColor: (book?.color ?? '#DAA520') + '30' } : {}}
              >
                <span
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                    isChecked
                      ? 'border-fantasy-gold bg-fantasy-gold text-parchment-900'
                      : 'border-parchment-500'
                  }`}
                >
                  {isChecked && '✓'}
                </span>
                <span className="truncate">{word}</span>
              </button>
            );
          })}
        </div>
        {filteredWords.length === 0 && (
          <p className="text-parchment-400 text-center py-4 italic">Aucun coche-mot trouvé.</p>
        )}
      </div>
    </motion.div>
  );
}
