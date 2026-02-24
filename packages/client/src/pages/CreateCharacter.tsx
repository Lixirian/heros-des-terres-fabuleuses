import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { professions, statsTable, RankRange } from '../data/professions';
import { pregenCharacters } from '../data/pregenCharacters';
import { gods } from '../data/equipment';
import { Profession } from '../data/types';

type Tab = 'custom' | 'pregen';

export default function CreateCharacter() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('custom');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Custom creation state
  const [name, setName] = useState('');
  const [profession, setProfession] = useState<Profession>('Guerrier');
  const [rankRange, setRankRange] = useState<RankRange>('1-2');
  const [god, setGod] = useState('Aucun');
  const [backstory, setBackstory] = useState('');
  const [portrait, setPortrait] = useState('');

  const stats = statsTable[profession]?.[rankRange];
  const profData = professions.find(p => p.name === profession)!;
  const rank = Number(rankRange.split('-')[0]);

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Le nom est requis'); return; }
    setSaving(true);
    try {
      const char = await api.createCharacter({
        name: name.trim(),
        profession,
        rank,
        stamina: stats.stamina,
        max_stamina: stats.stamina,
        defence: stats.defence,
        money: profession === 'Voleur' ? 20 : 16,
        combat: stats.combat,
        charisma: stats.charisma,
        magic: stats.magic,
        sanctity: stats.sanctity,
        scouting: stats.scouting,
        thievery: stats.thievery,
        god: god === 'Aucun' ? null : god,
        equipment: profData.startingEquipment,
        backstory,
        portrait: portrait || null,
      });
      navigate(`/character/${char.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPregen = async (pregenId: string) => {
    const pregen = pregenCharacters.find(p => p.pregen_id === pregenId);
    if (!pregen) return;
    setSaving(true);
    try {
      const char = await api.createCharacter({
        ...pregen,
        is_pregen: true,
        pregen_id: pregenId,
      });
      navigate(`/character/${char.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Créer un personnage</h2>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('custom')}
          className={`px-6 py-2 rounded-t-lg font-medieval transition-all ${
            tab === 'custom'
              ? 'bg-parchment-800 text-fantasy-gold border-t-2 border-x-2 border-fantasy-gold'
              : 'bg-parchment-800 text-parchment-400 hover:text-parchment-200'
          }`}
        >
          Personnalisé
        </button>
        <button
          onClick={() => setTab('pregen')}
          className={`px-6 py-2 rounded-t-lg font-medieval transition-all ${
            tab === 'pregen'
              ? 'bg-parchment-800 text-fantasy-gold border-t-2 border-x-2 border-fantasy-gold'
              : 'bg-parchment-800 text-parchment-400 hover:text-parchment-200'
          }`}
        >
          Prétirés
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-2 rounded text-sm">{error}</div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'custom' ? (
          <motion.form
            key="custom"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleCreateCustom}
            className="parchment-card space-y-6"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-body text-parchment-200 mb-1 font-semibold">Nom du personnage</label>
              <input value={name} onChange={e => setName(e.target.value)} className="fantasy-input" required placeholder="Ex: Aldric le Brave" />
            </div>

            {/* Portrait */}
            <div>
              <label className="block text-sm font-body text-parchment-200 mb-2 font-semibold">Portrait (optionnel)</label>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                <button
                  type="button"
                  onClick={() => setPortrait('')}
                  className={`w-14 h-14 rounded-full border-2 transition-all flex items-center justify-center ${
                    portrait === ''
                      ? 'border-fantasy-gold bg-fantasy-gold/10 shadow-lg shadow-fantasy-gold/20'
                      : 'border-parchment-600 hover:border-parchment-500'
                  }`}
                >
                  <span className="text-parchment-400 text-xs font-body text-center leading-tight">Aucun</span>
                </button>
                {Array.from({ length: 10 }, (_, i) => {
                  const src = `/assets/characters/gallery/gallery-${String(i + 1).padStart(2, '0')}.svg`;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPortrait(src)}
                      className={`w-14 h-14 rounded-full border-2 transition-all overflow-hidden ${
                        portrait === src
                          ? 'border-fantasy-gold shadow-lg shadow-fantasy-gold/20 scale-110'
                          : 'border-parchment-600 hover:border-parchment-500'
                      }`}
                    >
                      <img src={src} alt={`Portrait ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-body text-parchment-200 mb-2 font-semibold">Profession</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {professions.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setProfession(p.name)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      profession === p.name
                        ? 'border-fantasy-gold bg-fantasy-gold/10'
                        : 'border-parchment-600 hover:border-parchment-500'
                    }`}
                  >
                    <p className="font-medieval text-fantasy-gold">{p.nameFr}</p>
                    <p className="text-xs text-parchment-300 mt-1">{p.description.substring(0, 60)}...</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Rank Range */}
            <div>
              <label className="block text-sm font-body text-parchment-200 mb-2 font-semibold">Niveau de départ</label>
              <div className="flex gap-3">
                {(['1-2', '3-4', '5-6'] as RankRange[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRankRange(r)}
                    className={`px-6 py-2 rounded-lg border-2 font-medieval transition-all ${
                      rankRange === r
                        ? 'border-fantasy-gold bg-fantasy-gold/10 text-fantasy-gold'
                        : 'border-parchment-300 text-parchment-300 hover:border-parchment-400'
                    }`}
                  >
                    Rang {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Preview */}
            {stats && (
              <div className="bg-parchment-800/50 rounded-lg p-4 border border-parchment-600">
                <h4 className="font-medieval text-lg text-fantasy-gold mb-3">Caractéristiques ({profession} rang {rankRange})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.combat}</div>
                    <p className="text-xs text-parchment-300 mt-1">COMBAT</p>
                  </div>
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.charisma}</div>
                    <p className="text-xs text-parchment-300 mt-1">CHARISME</p>
                  </div>
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.magic}</div>
                    <p className="text-xs text-parchment-300 mt-1">MAGIE</p>
                  </div>
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.sanctity}</div>
                    <p className="text-xs text-parchment-300 mt-1">PIÉTÉ</p>
                  </div>
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.scouting}</div>
                    <p className="text-xs text-parchment-300 mt-1">EXPLORATION</p>
                  </div>
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.thievery}</div>
                    <p className="text-xs text-parchment-300 mt-1">ADRESSE</p>
                  </div>
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.defence}</div>
                    <p className="text-xs text-parchment-300 mt-1">DÉFENSE</p>
                  </div>
                  <div className="text-center">
                    <div className="stat-badge mx-auto">{stats.stamina}</div>
                    <p className="text-xs text-parchment-300 mt-1">ENDURANCE</p>
                  </div>
                </div>
              </div>
            )}

            {/* God */}
            <div>
              <label className="block text-sm font-body text-parchment-200 mb-1 font-semibold">Divinité</label>
              <select value={god} onChange={e => setGod(e.target.value)} className="fantasy-input">
                {gods.map(g => (
                  <option key={g.name} value={g.name}>{g.name} - {g.domain}</option>
                ))}
              </select>
            </div>

            {/* Backstory */}
            <div>
              <label className="block text-sm font-body text-parchment-200 mb-1 font-semibold">Histoire (optionnel)</label>
              <textarea value={backstory} onChange={e => setBackstory(e.target.value)} className="fantasy-input h-24 resize-y" placeholder="L'histoire de votre personnage..." />
            </div>

            {/* Starting Equipment Preview */}
            <div>
              <h4 className="font-medieval text-lg text-fantasy-gold mb-2">Équipement de départ</h4>
              <div className="flex flex-wrap gap-2">
                {profData.startingEquipment.map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-parchment-700/50 rounded text-sm text-parchment-100">
                    {item.name}
                    {item.bonus && <span className="text-fantasy-gold ml-1">(+{item.bonus.value} {item.bonus.stat})</span>}
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="fantasy-button w-full text-center text-lg">
              {saving ? 'Création...' : 'Créer le personnage'}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="pregen"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {pregenCharacters.map(pregen => (
              <div key={pregen.pregen_id} className="parchment-card">
                <div className="flex items-start gap-4">
                  {pregen.portrait ? (
                    <img
                      src={pregen.portrait}
                      alt={pregen.name}
                      className="w-16 h-16 rounded-full object-cover shadow-md flex-shrink-0 border-2 border-fantasy-gold/50 animate-breathe"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-2xl shadow-md flex-shrink-0 animate-breathe">
                      {pregen.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medieval text-xl text-fantasy-gold">{pregen.name}</h3>
                    <p className="text-parchment-300 text-sm">{pregen.profession} - Rang {pregen.rank}</p>
                    <p className="text-parchment-200 text-sm mt-1">{pregen.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-parchment-700/50 px-2 py-0.5 rounded">COM {pregen.combat}</span>
                      <span className="text-xs bg-parchment-700/50 px-2 py-0.5 rounded">CHA {pregen.charisma}</span>
                      <span className="text-xs bg-parchment-700/50 px-2 py-0.5 rounded">MAG {pregen.magic}</span>
                      <span className="text-xs bg-parchment-700/50 px-2 py-0.5 rounded">PIÉ {pregen.sanctity}</span>
                      <span className="text-xs bg-parchment-700/50 px-2 py-0.5 rounded">EXP {pregen.scouting}</span>
                      <span className="text-xs bg-parchment-700/50 px-2 py-0.5 rounded">ADR {pregen.thievery}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-parchment-500">END: {pregen.stamina}</span>
                      <span className="text-xs text-parchment-500">DEF: {pregen.defence}</span>
                      <span className="text-xs text-parchment-500">Livres: {pregen.books.join(', ')}</span>
                    </div>
                    <button
                      onClick={() => handleSelectPregen(pregen.pregen_id)}
                      disabled={saving}
                      className="fantasy-button text-sm mt-3"
                    >
                      Choisir ce personnage
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
