import { useState } from 'react';
import { motion } from 'framer-motion';
import { books } from '../data/books';

const regions = [
  {
    bookId: 1,
    name: 'Sokara',
    path: 'M 100 200 L 200 150 L 280 180 L 300 280 L 250 350 L 150 320 Z',
    labelPos: { x: 190, y: 260 },
  },
  {
    bookId: 2,
    name: 'Golnir',
    path: 'M 300 280 L 280 180 L 380 140 L 450 200 L 440 310 L 350 340 Z',
    labelPos: { x: 370, y: 250 },
  },
  {
    bookId: 3,
    name: 'Mer de Sang Noir',
    path: 'M 150 350 L 250 350 L 350 340 L 440 310 L 500 400 L 450 500 L 300 520 L 150 480 Z',
    labelPos: { x: 320, y: 430 },
  },
  {
    bookId: 4,
    name: 'Grandes Steppes',
    path: 'M 450 200 L 550 140 L 680 160 L 700 280 L 620 330 L 500 310 L 440 310 Z',
    labelPos: { x: 580, y: 240 },
  },
  {
    bookId: 5,
    name: 'Uttaku',
    path: 'M 500 310 L 620 330 L 700 280 L 750 350 L 720 450 L 600 470 L 500 400 Z',
    labelPos: { x: 620, y: 390 },
  },
  {
    bookId: 6,
    name: 'Akatsurai',
    path: 'M 750 200 L 850 180 L 900 250 L 880 350 L 800 380 L 750 350 L 700 280 Z',
    labelPos: { x: 810, y: 280 },
  },
];

export default function MapView() {
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const selectedBook = selectedRegion ? books.find(b => b.id === selectedRegion) : null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Carte des Terres Fabuleuses</h2>

      {/* Controls */}
      <div className="flex gap-3 items-center">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="fantasy-button text-sm px-3 py-1">+</button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="fantasy-button text-sm px-3 py-1">-</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="fantasy-button text-sm px-3 py-1">Reset</button>
        <span className="text-parchment-400 text-sm">Zoom: {Math.round(zoom * 100)}%</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {books.map(book => (
          <button
            key={book.id}
            onClick={() => setSelectedRegion(selectedRegion === book.id ? null : book.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-all ${
              selectedRegion === book.id ? 'ring-2 ring-white' : ''
            }`}
            style={{ backgroundColor: book.color + '40', color: book.colorAccent }}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: book.color }} />
            {book.region}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div
        className="parchment-card overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: '500px', position: 'relative' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center',
            transition: dragging ? 'none' : 'transform 0.2s',
          }}
        >
          {/* Background */}
          <rect width="1000" height="600" fill="#f5e6c8" rx="10" />

          {/* Grid lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i}>
              <line x1={i * 100} y1="0" x2={i * 100} y2="600" stroke="#e0b868" strokeWidth="0.5" opacity="0.3" />
              <line x1="0" y1={i * 60} x2="1000" y2={i * 60} stroke="#e0b868" strokeWidth="0.5" opacity="0.3" />
            </g>
          ))}

          {/* Decorative sea */}
          <path d="M 0 550 Q 200 520 400 550 Q 600 580 800 550 Q 900 535 1000 560 L 1000 600 L 0 600 Z"
                fill="#1B3A5C" opacity="0.2" />

          {/* Regions */}
          {regions.map(region => {
            const book = books.find(b => b.id === region.bookId);
            if (!book) return null;
            const isHovered = hoveredRegion === region.bookId;
            const isSelected = selectedRegion === region.bookId;

            return (
              <g key={region.bookId}>
                <motion.path
                  d={region.path}
                  fill={book.color}
                  fillOpacity={isHovered || isSelected ? 0.7 : 0.4}
                  stroke={book.colorAccent}
                  strokeWidth={isHovered || isSelected ? 3 : 1.5}
                  onMouseEnter={() => setHoveredRegion(region.bookId)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setSelectedRegion(selectedRegion === region.bookId ? null : region.bookId)}
                  style={{ cursor: 'pointer' }}
                  animate={{
                    fillOpacity: isHovered || isSelected ? 0.7 : 0.4,
                    strokeWidth: isHovered || isSelected ? 3 : 1.5,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <text
                  x={region.labelPos.x}
                  y={region.labelPos.y}
                  textAnchor="middle"
                  className="font-medieval"
                  fill={book.colorAccent}
                  fontSize={isHovered || isSelected ? "16" : "14"}
                  fontWeight="bold"
                  pointerEvents="none"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {region.name}
                </text>
              </g>
            );
          })}

          {/* Title */}
          <text x="500" y="50" textAnchor="middle" className="font-medieval" fill="#5C3A1E" fontSize="24" fontWeight="bold">
            Les Terres Fabuleuses
          </text>

          {/* Compass */}
          <g transform="translate(920, 80)">
            <circle r="25" fill="none" stroke="#946b24" strokeWidth="1.5" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#946b24" strokeWidth="1" />
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#946b24" strokeWidth="1" />
            <text y="-28" textAnchor="middle" fill="#946b24" fontSize="10" fontWeight="bold">N</text>
          </g>
        </svg>
      </div>

      {/* Selected Region Info */}
      {selectedBook && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="parchment-card"
          style={{ borderLeftColor: selectedBook.color, borderLeftWidth: '4px' }}
        >
          <h3 className="font-medieval text-xl text-fantasy-brown">
            Livre {selectedBook.id} : {selectedBook.titleFr}
          </h3>
          <p className="text-sm text-parchment-600 italic">{selectedBook.title}</p>
          <p className="text-parchment-700 mt-2">{selectedBook.description}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
