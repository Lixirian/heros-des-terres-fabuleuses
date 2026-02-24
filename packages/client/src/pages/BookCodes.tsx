import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { books, getBook } from '../data/books';

export default function BookCodes() {
  const { bookId } = useParams();
  const [selectedBook, setSelectedBook] = useState<number>(bookId ? Number(bookId) : 1);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<number | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [noteCode, setNoteCode] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const book = getBook(selectedBook);

  useEffect(() => {
    api.getCharacters().then(setCharacters);
  }, []);

  useEffect(() => {
    if (selectedCharId && selectedBook) {
      api.getBookProgress(selectedCharId, selectedBook).then(setProgress);
    } else {
      setProgress([]);
    }
  }, [selectedCharId, selectedBook]);

  const toggleCode = async (code: number) => {
    if (!selectedCharId) return;
    const updated = await api.toggleCode(selectedCharId, selectedBook, code);
    setProgress(updated);
  };

  const saveNote = async (code: number) => {
    if (!selectedCharId) return;
    await api.toggleCode(selectedCharId, selectedBook, code, noteText);
    const updated = await api.getBookProgress(selectedCharId, selectedBook);
    setProgress(updated);
    setNoteCode(null);
    setNoteText('');
  };

  const isVisited = (code: number) => progress.some(p => p.code_number === code);
  const getNote = (code: number) => progress.find(p => p.code_number === code)?.notes || '';

  const visitedCount = progress.length;
  const maxCode = book?.maxCode ?? 660;

  const filteredCodes = searchCode
    ? [Number(searchCode)].filter(n => n > 0 && n <= maxCode)
    : [];

  // Generate code ranges for display
  const codeRanges = [];
  for (let start = 1; start <= maxCode; start += 20) {
    const end = Math.min(start + 19, maxCode);
    codeRanges.push({ start, end });
  }

  const [expandedRange, setExpandedRange] = useState<number | null>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Livres & Codes</h2>

      {/* Book Selector */}
      <div className="flex flex-wrap gap-2">
        {books.map(b => (
          <button
            key={b.id}
            onClick={() => { setSelectedBook(b.id); setExpandedRange(null); }}
            className={`px-4 py-2 rounded-lg font-medieval text-sm transition-all ${
              selectedBook === b.id
                ? 'text-white shadow-lg'
                : 'bg-parchment-800 text-parchment-400 hover:text-parchment-200'
            }`}
            style={selectedBook === b.id ? { backgroundColor: b.color } : {}}
          >
            Livre {b.id}
          </button>
        ))}
      </div>

      {book && (
        <div className="parchment-card" style={{ borderLeftColor: book.color, borderLeftWidth: '4px' }}>
          <h3 className="font-medieval text-xl text-fantasy-brown">{book.titleFr}</h3>
          <p className="text-sm text-parchment-600 italic">{book.title}</p>
          <p className="text-parchment-700 mt-2">{book.description}</p>
          <p className="text-sm text-parchment-500 mt-1">{book.region} - {maxCode} codes</p>
        </div>
      )}

      {/* Character Selector for Progress */}
      <div className="parchment-card">
        <h3 className="font-medieval text-lg text-fantasy-brown mb-3">Suivi de progression</h3>
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
            <div className="flex-1 bg-parchment-300/30 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${(visitedCount / maxCode) * 100}%`,
                  backgroundColor: book?.color ?? '#DAA520',
                }}
              />
            </div>
            <span className="text-sm text-parchment-600 font-semibold whitespace-nowrap">
              {visitedCount} / {maxCode}
            </span>
          </div>
        )}
      </div>

      {/* Code Search */}
      <div className="parchment-card">
        <div className="flex gap-3">
          <input
            type="number"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            className="fantasy-input flex-1"
            placeholder="Chercher un code (ex: 42)"
            min={1}
            max={maxCode}
          />
        </div>
        {filteredCodes.length > 0 && selectedCharId && (
          <div className="mt-3">
            {filteredCodes.map(code => (
              <div key={code} className="flex items-center justify-between p-3 bg-parchment-50 rounded border border-parchment-300">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCode(code)}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${
                      isVisited(code) ? 'bg-fantasy-gold border-fantasy-gold text-parchment-900' : 'border-parchment-400'
                    }`}
                  >
                    {isVisited(code) && '✓'}
                  </button>
                  <span className="font-medieval text-lg text-fantasy-brown">Code {code}</span>
                </div>
                <div className="flex gap-2">
                  {getNote(code) && <span className="text-xs text-parchment-500 italic">{getNote(code).substring(0, 30)}...</span>}
                  <button
                    onClick={() => { setNoteCode(code); setNoteText(getNote(code)); }}
                    className="text-xs text-fantasy-gold hover:underline"
                  >
                    Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Modal */}
      {noteCode !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setNoteCode(null)}>
          <div className="parchment-card w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-medieval text-lg text-fantasy-brown mb-3">Note - Code {noteCode}</h3>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="fantasy-input h-32 resize-y"
              placeholder="Vos notes pour ce code..."
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => saveNote(noteCode)} className="fantasy-button flex-1 text-center">Sauvegarder</button>
              <button onClick={() => setNoteCode(null)} className="fantasy-button-danger flex-1 text-center">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Code Ranges Grid */}
      {selectedCharId && (
        <div className="space-y-2">
          {codeRanges.map(({ start, end }) => {
            const rangeVisited = progress.filter(p => p.code_number >= start && p.code_number <= end).length;
            const rangeTotal = end - start + 1;
            const isExpanded = expandedRange === start;

            return (
              <div key={start} className="parchment-card p-3">
                <button
                  onClick={() => setExpandedRange(isExpanded ? null : start)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="font-medieval text-fantasy-brown">Codes {start} - {end}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-parchment-500">{rangeVisited}/{rangeTotal}</span>
                    <span className="text-parchment-500">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-5 sm:grid-cols-10 gap-1 mt-3"
                  >
                    {Array.from({ length: rangeTotal }, (_, i) => start + i).map(code => (
                      <button
                        key={code}
                        onClick={() => toggleCode(code)}
                        className={`w-full aspect-square rounded text-xs font-semibold transition-all ${
                          isVisited(code)
                            ? 'text-parchment-900 shadow-inner'
                            : 'bg-parchment-200 text-parchment-500 hover:bg-parchment-300'
                        }`}
                        style={isVisited(code) ? { backgroundColor: book?.color ?? '#DAA520', color: 'white' } : {}}
                        title={getNote(code) ? `Note: ${getNote(code)}` : `Code ${code}`}
                      >
                        {code}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
