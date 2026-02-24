import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { books } from '../data/books';

const mapImages: Record<number, string> = {
  1: '/assets/maps/color-fr-book1-sokara.jpg',
  2: '/assets/maps/color-fr-book2-golnir.jpg',
  3: '/assets/maps/color-fr-book3-ocean-violet.jpg',
  4: '/assets/maps/color-fr-book4-steppes.jpg',
  5: '/assets/maps/web-book5-uttaku.jpg',
  6: '/assets/maps/web-book6-akatsurai.jpg',
};

export default function MapView() {
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const book = books.find(b => b.id === selectedBook)!;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Cartes des Terres Fabuleuses</h2>

      {/* Book Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {books.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBook(b.id)}
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
              {b.id}
            </span>
            <span className="hidden sm:inline">{b.region}</span>
          </button>
        ))}
      </div>

      {/* Book Info Banner */}
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
        <p className="text-parchment-200 mt-2 text-sm">{book.description}</p>
        <p className="text-parchment-400 text-xs mt-1">{book.region} &mdash; {book.maxCode} sections</p>
      </div>

      {/* Map Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedBook}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg overflow-hidden shadow-2xl border-2"
          style={{ borderColor: book.color + '60' }}
        >
          <img
            src={mapImages[selectedBook]}
            alt={`Carte de ${book.region} - ${book.titleFr}`}
            className="w-full h-auto"
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>

      {/* All Maps Grid (thumbnails) */}
      <div>
        <h3 className="font-medieval text-xl text-fantasy-gold mb-4">Toutes les cartes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {books.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBook(b.id)}
              className={`rounded-lg overflow-hidden shadow-lg transition-all hover:scale-[1.02] border-2 ${
                selectedBook === b.id ? 'ring-2 ring-offset-2 ring-offset-parchment-900' : ''
              }`}
              style={{ borderColor: selectedBook === b.id ? b.color : 'transparent' }}
            >
              <div className="relative">
                <img
                  src={mapImages[b.id]}
                  alt={`Carte ${b.region}`}
                  className="w-full h-32 md:h-40 object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3"
                >
                  <div>
                    <p className="font-medieval text-white text-sm">{b.region}</p>
                    <p className="text-white/70 text-xs">Livre {b.id}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
