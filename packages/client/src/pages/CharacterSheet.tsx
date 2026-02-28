import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { Character, EquipmentItem } from '../data/types';
import { books } from '../data/books';
import { gods, allEquipment } from '../data/equipment';
import { statsTable, RankRange } from '../data/professions';

const statLabels: Record<string, string> = {
  combat: 'COMBAT',
  charisma: 'CHARISME',
  magic: 'MAGIE',
  sanctity: 'PIÉTÉ',
  scouting: 'EXPLORATION',
  thievery: 'ADRESSE',
};

export default function CharacterSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [char, setChar] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [combatLogs, setCombatLogs] = useState<any[]>([]);
  const [bookProgress, setBookProgress] = useState<Record<number, number>>({});
  const [showRankModal, setShowRankModal] = useState(false);
  const [pendingRank, setPendingRank] = useState<number | null>(null);
  const [showPortraitPicker, setShowPortraitPicker] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const [equipSearch, setEquipSearch] = useState('');
  const [equipDropdownOpen, setEquipDropdownOpen] = useState(false);
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [customItem, setCustomItem] = useState<{ name: string; type: 'arme' | 'armure' | 'objet'; bonusStat: string; bonusValue: string }>({ name: '', type: 'objet', bonusStat: '', bonusValue: '' });
  const equipSearchRef = useRef<HTMLDivElement>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<'tous' | 'arme' | 'armure' | 'objet'>('tous');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handlePortraitUpload = async (file: File) => {
    if (!id) return;
    setUploadingPortrait(true);
    try {
      const result = await api.uploadPortrait(Number(id), file);
      setEditData({ ...editData, portrait: result.portrait });
      setShowPortraitPicker(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPortrait(false);
    }
  };

  // Fermer le dropdown équipement au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (equipSearchRef.current && !equipSearchRef.current.contains(e.target as Node)) {
        setEquipDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (id) {
      api.getCharacter(Number(id))
        .then(c => {
          // Parse JSON fields
          const parsed = {
            ...c,
            blessings: typeof c.blessings === 'string' ? JSON.parse(c.blessings) : c.blessings || [],
            titles: typeof c.titles === 'string' ? JSON.parse(c.titles) : c.titles || [],
            equipment: typeof c.equipment === 'string' ? JSON.parse(c.equipment) : c.equipment || [],
            codewords: typeof c.codewords === 'string' ? JSON.parse(c.codewords) : c.codewords || [],
            temp_bonuses: typeof c.temp_bonuses === 'string' ? JSON.parse(c.temp_bonuses) : c.temp_bonuses || {},
            is_initiate: !!c.is_initiate,
            is_dead: !!c.is_dead,
          };
          setChar(parsed);
          setEditData(parsed);
        })
        .catch(() => navigate('/'));

      // Charger les logs de combat
      api.getCombatLogs(Number(id)).then(setCombatLogs).catch(() => {});

      // Charger la progression par livre
      Promise.all(
        books.map(b => api.getBookProgress(Number(id), b.id).then(p => ({ bookId: b.id, count: p.length })))
      ).then(results => {
        const progress: Record<number, number> = {};
        results.forEach(r => { progress[r.bookId] = r.count; });
        setBookProgress(progress);
      }).catch(() => {});
    }
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id) return;
    // Validations avant sauvegarde
    const validated = { ...editData };
    validated.money = Math.max(0, validated.money ?? 0);
    validated.stamina = Math.max(0, Math.min(validated.stamina ?? 0, validated.max_stamina ?? 99));
    validated.max_stamina = Math.max(1, validated.max_stamina ?? 1);
    validated.rank = Math.max(1, Math.min(10, validated.rank ?? 1));
    validated.defence = Math.max(0, validated.defence ?? 0);
    // Limiter équipement à 12
    if (validated.equipment && validated.equipment.length > 12) {
      validated.equipment = validated.equipment.slice(0, 12);
    }
    setSaving(true);
    setSaveError(null);
    try {
      await api.updateCharacter(Number(id), validated);
      setChar({ ...char, ...validated });
      setEditData(validated);
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Supprimer ce personnage définitivement ?')) return;
    await api.deleteCharacter(Number(id));
    navigate('/');
  };

  // Calculer les bonus d'équipement par stat (utilise editData en mode édition)
  const equipBonuses: Record<string, number> = {};
  if (char) {
    const equipSource = editing ? (editData.equipment || []) : (char.equipment || []);
    for (const item of equipSource as EquipmentItem[]) {
      if (item.bonus) {
        equipBonuses[item.bonus.stat] = (equipBonuses[item.bonus.stat] || 0) + item.bonus.value;
      }
    }
  }

  if (!char) return <div className="text-parchment-400 text-center py-8">Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="parchment-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {editing ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPortraitPicker(!showPortraitPicker)}
                  className="relative group"
                >
                  {editData.portrait ? (
                    <img src={editData.portrait} alt={editData.name}
                      className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-fantasy-gold/50" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-3xl shadow-lg">
                      {editData.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-body">Changer</span>
                  </div>
                </button>
                {showPortraitPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-parchment-900 border-2 border-fantasy-gold/50 rounded-lg shadow-xl z-50 w-72">
                    <p className="text-parchment-300 text-xs mb-2 font-body">Choisir un portrait :</p>
                    <div className="grid grid-cols-6 gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditData({ ...editData, portrait: null }); setShowPortraitPicker(false); }}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          !editData.portrait ? 'border-fantasy-gold bg-fantasy-gold/10' : 'border-parchment-600 hover:border-parchment-500'
                        }`}
                      >
                        <span className="text-parchment-400 text-[9px] font-body">Aucun</span>
                      </button>
                      {Array.from({ length: 10 }, (_, i) => {
                        const src = `/assets/characters/gallery/gallery-${String(i + 1).padStart(2, '0')}.svg`;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setEditData({ ...editData, portrait: src }); setShowPortraitPicker(false); }}
                            className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden ${
                              editData.portrait === src ? 'border-fantasy-gold scale-110' : 'border-parchment-600 hover:border-parchment-500'
                            }`}
                          >
                            <img src={src} alt={`Portrait ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                    <input
                      ref={portraitInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handlePortraitUpload(file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => portraitInputRef.current?.click()}
                      disabled={uploadingPortrait}
                      className="mt-2 w-full text-center text-xs font-body py-1.5 rounded border border-dashed border-parchment-500 text-parchment-300 hover:border-fantasy-gold hover:text-fantasy-gold transition-all disabled:opacity-50"
                    >
                      {uploadingPortrait ? 'Envoi en cours...' : 'Importer une image'}
                    </button>
                  </div>
                )}
              </div>
            ) : char.portrait ? (
              <img src={char.portrait} alt={char.name}
                className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-fantasy-gold/50 animate-breathe" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-3xl shadow-lg animate-breathe">
                {char.name[0]}
              </div>
            )}
            <div>
              {editing ? (
                <input
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="fantasy-input text-xl font-medieval"
                />
              ) : (
                <h2 className="font-medieval text-3xl text-fantasy-gold">{char.name}</h2>
              )}
              <p className="text-parchment-300">
                {char.profession} - Rang {char.rank}
                {char.is_dead && <span className="text-fantasy-red ml-2 font-bold">(MORT)</span>}
              </p>
              {char.god && char.god !== 'Aucun' && (
                <p className="text-parchment-500 text-sm italic">
                  Divinité : {char.god}
                  {char.is_initiate && <span className="text-yellow-400"> (initié)</span>}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="fantasy-button text-sm">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                {saveError && <span className="text-red-400 text-sm">{saveError}</span>}
                <button onClick={() => { setEditing(false); setEditData(char); setSaveError(null); }} className="fantasy-button-danger text-sm">
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="fantasy-button text-sm">Modifier</button>
                <Link to={`/combat/${id}`} className="fantasy-button text-sm">Combat</Link>
                <button onClick={handleDelete} className="fantasy-button-danger text-sm">Supprimer</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="parchment-card">
        <h3 className="section-title">Compétences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(statLabels).map(([key, label]) => {
            const equipBonus = equipBonuses[key] || 0;
            const tempBonus = (editing ? editData.temp_bonuses?.[key] : char.temp_bonuses?.[key]) || 0;
            const base = editing ? (editData[key] ?? 0) : char[key];
            const total = base + equipBonus + tempBonus;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="stat-badge">
                  {editing ? (
                    <input
                      type="number"
                      value={editData[key] ?? 0}
                      onChange={e => setEditData({ ...editData, [key]: Number(e.target.value) })}
                      className="w-8 text-center bg-transparent text-fantasy-gold"
                      min={1}
                      max={12}
                    />
                  ) : (
                    total
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-parchment-200 text-sm font-semibold">{label}</span>
                    {editing && (
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, temp_bonuses: { ...editData.temp_bonuses, [key]: (editData.temp_bonuses?.[key] || 0) - 1 } })}
                          className="w-5 h-5 flex items-center justify-center rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700 hover:bg-cyan-800/50 text-xs font-bold"
                        >-</button>
                        <span className="text-cyan-300 text-xs font-bold w-4 text-center">{editData.temp_bonuses?.[key] || 0}</span>
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, temp_bonuses: { ...editData.temp_bonuses, [key]: (editData.temp_bonuses?.[key] || 0) + 1 } })}
                          className="w-5 h-5 flex items-center justify-center rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700 hover:bg-cyan-800/50 text-xs font-bold"
                        >+</button>
                      </div>
                    )}
                  </div>
                  {!editing && (equipBonus > 0 || tempBonus !== 0) && (
                    <span className="text-xs">
                      <span className="text-parchment-400">({base}</span>
                      {equipBonus > 0 && <span className="text-green-400">+{equipBonus}</span>}
                      {tempBonus > 0 && <span className="text-cyan-400">+{tempBonus}</span>}
                      {tempBonus < 0 && <span className="text-cyan-400">{tempBonus}</span>}
                      <span className="text-parchment-400">)</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vital Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="parchment-card">
          <h3 className="section-title">Stats vitales</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-body text-parchment-200 font-semibold">Endurance</span>
              {editing ? (
                <div className="flex gap-1 items-center">
                  <input type="number" value={editData.stamina} onChange={e => setEditData({ ...editData, stamina: Math.min(Number(e.target.value), editData.max_stamina) })} className="fantasy-input w-16 text-center text-sm" min={0} max={editData.max_stamina} />
                  <span className="text-parchment-500">/</span>
                  <input type="number" value={editData.max_stamina} onChange={e => setEditData({ ...editData, max_stamina: Math.max(1, Number(e.target.value)) })} className="fantasy-input w-16 text-center text-sm" min={1} />
                </div>
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">{char.stamina} / {char.max_stamina}</span>
              )}
            </div>
            <div className="w-full bg-parchment-700/30 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-fantasy-red to-fantasy-gold transition-all duration-500"
                style={{ width: `${(char.stamina / char.max_stamina) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body text-parchment-200 font-semibold">Défense</span>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input type="number" value={editData.defence} onChange={e => setEditData({ ...editData, defence: Math.max(0, Number(e.target.value)) })} className="fantasy-input w-16 text-center text-sm" min={0} />
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditData({ ...editData, temp_bonuses: { ...editData.temp_bonuses, defence: (editData.temp_bonuses?.defence || 0) - 1 } })} className="w-5 h-5 flex items-center justify-center rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700 hover:bg-cyan-800/50 text-xs font-bold">-</button>
                    <span className="text-cyan-300 text-xs font-bold w-4 text-center">{editData.temp_bonuses?.defence || 0}</span>
                    <button type="button" onClick={() => setEditData({ ...editData, temp_bonuses: { ...editData.temp_bonuses, defence: (editData.temp_bonuses?.defence || 0) + 1 } })} className="w-5 h-5 flex items-center justify-center rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700 hover:bg-cyan-800/50 text-xs font-bold">+</button>
                  </div>
                </div>
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">
                  {char.defence + (equipBonuses['defence'] || 0) + (char.temp_bonuses?.defence || 0)}
                  {((equipBonuses['defence'] || 0) > 0 || (char.temp_bonuses?.defence || 0) !== 0) && (
                    <span className="text-xs ml-1 font-body">
                      <span className="text-parchment-400">({char.defence}</span>
                      {(equipBonuses['defence'] || 0) > 0 && <span className="text-green-400">+{equipBonuses['defence']}</span>}
                      {(char.temp_bonuses?.defence || 0) > 0 && <span className="text-cyan-400">+{char.temp_bonuses.defence}</span>}
                      {(char.temp_bonuses?.defence || 0) < 0 && <span className="text-cyan-400">{char.temp_bonuses.defence}</span>}
                      <span className="text-parchment-400">)</span>
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="font-body text-parchment-200 font-semibold">Argent (chardes)</span>
              {editing ? (
                <input type="number" value={editData.money} onChange={e => setEditData({ ...editData, money: Math.max(0, Number(e.target.value)) })} className="fantasy-input w-16 text-center text-sm" min={0} />
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">{char.money}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="font-body text-parchment-200 font-semibold">Rang</span>
              {editing ? (
                <input
                  type="number"
                  value={editData.rank}
                  onChange={e => {
                    const newRank = Number(e.target.value);
                    setEditData({ ...editData, rank: newRank });
                    if (newRank !== char.rank && newRank >= 1 && newRank <= 10) {
                      setPendingRank(newRank);
                      setShowRankModal(true);
                    }
                  }}
                  className="fantasy-input w-16 text-center text-sm"
                  min={1}
                  max={10}
                />
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">{char.rank}</span>
              )}
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="parchment-card">
          <h3 className="section-title">Équipement ({(editing ? editData.equipment : char.equipment || []).length}/12)</h3>
          <div className="space-y-2">
            {editing ? (
              <>
                {(editData.equipment || []).length === 0 ? (
                  <p className="text-parchment-500 italic">Aucun équipement</p>
                ) : (
                  (editData.equipment || []).map((item: EquipmentItem, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-parchment-600/50 last:border-0">
                      <div>
                        <span className="font-body text-parchment-100">{item.name}</span>
                        {item.bonus && (
                          <span className="text-xs text-fantasy-gold ml-2">(+{item.bonus.value} {item.bonus.stat})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-parchment-500 capitalize">{item.type}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newEquip = [...(editData.equipment || [])];
                            newEquip.splice(i, 1);
                            setEditData({ ...editData, equipment: newEquip });
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-800/50 text-xs font-bold"
                        >✕</button>
                      </div>
                    </div>
                  ))
                )}

                {/* Recherche catalogue */}
                {(editData.equipment || []).length < 12 && (
                  <div className="pt-2 space-y-2">
                    <div className="relative" ref={equipSearchRef}>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={equipSearch}
                          onChange={e => { setEquipSearch(e.target.value); setEquipDropdownOpen(true); }}
                          onFocus={() => setEquipDropdownOpen(true)}
                          placeholder="Rechercher un objet..."
                          className="fantasy-input flex-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCatalog(true)}
                          className="fantasy-button text-xs whitespace-nowrap"
                        >Catalogue</button>
                      </div>
                      {equipDropdownOpen && (() => {
                        const filtered = equipSearch.length >= 1
                          ? allEquipment.filter(e => e.name.toLowerCase().includes(equipSearch.toLowerCase()))
                          : allEquipment;
                        const grouped: Record<string, EquipmentItem[]> = {};
                        for (const item of filtered) {
                          const cat = item.type === 'arme' ? 'Armes' : item.type === 'armure' ? 'Armures' : 'Objets';
                          (grouped[cat] ||= []).push(item);
                        }
                        if (filtered.length === 0) return (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-parchment-900 border border-fantasy-gold/50 rounded-lg shadow-xl p-3">
                            <p className="text-parchment-500 text-sm italic">Aucun résultat</p>
                          </div>
                        );
                        return (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-parchment-900 border border-fantasy-gold/50 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                            {['Armes', 'Armures', 'Objets'].map(cat => {
                              const items = grouped[cat];
                              if (!items || items.length === 0) return null;
                              return (
                                <div key={cat}>
                                  <div className="px-3 py-1.5 bg-parchment-800/80 sticky top-0 border-b border-fantasy-gold/30">
                                    <span className="font-medieval text-fantasy-gold text-xs">{cat}</span>
                                  </div>
                                  {items.map((item, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        setEditData({ ...editData, equipment: [...(editData.equipment || []), item] });
                                        setEquipSearch('');
                                        setEquipDropdownOpen(false);
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-parchment-700/50 transition-colors border-b border-parchment-700/20 last:border-0"
                                    >
                                      <span className="text-parchment-100 text-sm">{item.name}</span>
                                      {item.bonus && (
                                        <span className="text-xs text-fantasy-gold ml-2">(+{item.bonus.value} {statLabels[item.bonus.stat] || item.bonus.stat})</span>
                                      )}
                                      {item.description && (
                                        <p className="text-xs text-parchment-500 mt-0.5">{item.description}</p>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Objet personnalisé */}
                    {!showCustomItemForm ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomItemForm(true)}
                        className="text-sm text-parchment-400 hover:text-fantasy-gold transition-colors"
                      >+ Objet personnalisé</button>
                    ) : (
                      <div className="p-3 bg-parchment-800/50 rounded-lg border border-parchment-600 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customItem.name}
                            onChange={e => setCustomItem({ ...customItem, name: e.target.value })}
                            placeholder="Nom de l'objet"
                            className="fantasy-input flex-1 text-sm"
                          />
                          <select
                            value={customItem.type}
                            onChange={e => setCustomItem({ ...customItem, type: e.target.value as 'arme' | 'armure' | 'objet' })}
                            className="fantasy-input text-sm w-24"
                          >
                            <option value="arme">Arme</option>
                            <option value="armure">Armure</option>
                            <option value="objet">Objet</option>
                          </select>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-parchment-400 text-xs">Bonus :</span>
                          <select
                            value={customItem.bonusStat}
                            onChange={e => setCustomItem({ ...customItem, bonusStat: e.target.value })}
                            className="fantasy-input text-sm flex-1"
                          >
                            <option value="">Aucun</option>
                            <option value="combat">Combat</option>
                            <option value="charisma">Charisme</option>
                            <option value="magic">Magie</option>
                            <option value="sanctity">Piété</option>
                            <option value="scouting">Exploration</option>
                            <option value="thievery">Adresse</option>
                            <option value="defence">Défense</option>
                          </select>
                          {customItem.bonusStat && (
                            <input
                              type="number"
                              value={customItem.bonusValue}
                              onChange={e => setCustomItem({ ...customItem, bonusValue: e.target.value })}
                              placeholder="+1"
                              className="fantasy-input text-sm w-16 text-center"
                              min={1}
                              max={10}
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!customItem.name.trim()) return;
                              const newItem: EquipmentItem = {
                                name: customItem.name.trim(),
                                type: customItem.type,
                              };
                              if (customItem.bonusStat && customItem.bonusValue) {
                                newItem.bonus = { stat: customItem.bonusStat, value: Number(customItem.bonusValue) };
                              }
                              setEditData({ ...editData, equipment: [...(editData.equipment || []), newItem] });
                              setCustomItem({ name: '', type: 'objet', bonusStat: '', bonusValue: '' });
                              setShowCustomItemForm(false);
                            }}
                            className="fantasy-button text-xs"
                          >Ajouter</button>
                          <button
                            type="button"
                            onClick={() => { setShowCustomItemForm(false); setCustomItem({ name: '', type: 'objet', bonusStat: '', bonusValue: '' }); }}
                            className="text-xs text-parchment-500 hover:text-parchment-300 transition-colors"
                          >Annuler</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {(char.equipment || []).length === 0 ? (
                  <p className="text-parchment-500 italic">Aucun équipement</p>
                ) : (
                  (char.equipment || []).map((item: EquipmentItem, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-parchment-600/50 last:border-0">
                      <div>
                        <span className="font-body text-parchment-100">{item.name}</span>
                        {item.bonus && (
                          <span className="text-xs text-fantasy-gold ml-2">(+{item.bonus.value} {statLabels[item.bonus.stat] || item.bonus.stat})</span>
                        )}
                      </div>
                      <span className="text-xs text-parchment-500 capitalize">{item.type}</span>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => setShowCatalog(true)}
                  className="mt-2 text-sm text-parchment-400 hover:text-fantasy-gold transition-colors"
                >Consulter le catalogue</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions : Guérison, Temple, Résurrection */}
      {!editing && (
        <div className="parchment-card">
          <h3 className="section-title">Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Repos */}
            <button
              onClick={async () => {
                if (char.stamina >= char.max_stamina) return;
                const newStamina = Math.min(char.max_stamina, char.stamina + 1);
                await api.updateCharacter(Number(id), { stamina: newStamina });
                setChar({ ...char, stamina: newStamina });
              }}
              disabled={char.stamina >= char.max_stamina || char.is_dead}
              className="p-3 rounded-lg border border-parchment-600 hover:border-green-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-medieval text-green-400">Repos</p>
              <p className="text-xs text-parchment-400">Récupère +1 Endurance</p>
              <p className="text-xs text-parchment-500 mt-1">Gratuit (entre les combats)</p>
            </button>

            {/* Guérison au temple */}
            <button
              onClick={async () => {
                if (char.stamina >= char.max_stamina || char.money < 10) return;
                const healAmount = Math.min(char.max_stamina - char.stamina, Math.floor(char.money / 10));
                const cost = healAmount * 10;
                const newStamina = char.stamina + healAmount;
                const newMoney = char.money - cost;
                await api.updateCharacter(Number(id), { stamina: newStamina, money: newMoney });
                setChar({ ...char, stamina: newStamina, money: newMoney });
              }}
              disabled={char.stamina >= char.max_stamina || char.money < 10 || char.is_dead}
              className="p-3 rounded-lg border border-parchment-600 hover:border-blue-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-medieval text-blue-400">Temple - Guérison</p>
              <p className="text-xs text-parchment-400">Restaure toute l'Endurance</p>
              <p className="text-xs text-parchment-500 mt-1">Coût : 10 chardes/point</p>
            </button>

            {/* Arrangement de résurrection */}
            <button
              onClick={async () => {
                if (char.resurrection_arrangement) return;
                const templeName = char.god ? `Temple de ${char.god}` : 'Temple local';
                const cost = char.is_initiate ? 200 : 500;
                if (char.money < cost) return;
                await api.updateCharacter(Number(id), {
                  resurrection_arrangement: templeName,
                  money: char.money - cost,
                });
                setChar({ ...char, resurrection_arrangement: templeName, money: char.money - cost });
              }}
              disabled={!!char.resurrection_arrangement || char.money < (char.is_initiate ? 200 : 500) || char.is_dead}
              className="p-3 rounded-lg border border-parchment-600 hover:border-purple-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-medieval text-purple-400">Arrangement de résurrection</p>
              <p className="text-xs text-parchment-400">
                {char.resurrection_arrangement
                  ? `Actif : ${char.resurrection_arrangement}`
                  : 'Conclure un arrangement au temple'}
              </p>
              <p className="text-xs text-parchment-500 mt-1">
                Coût : {char.is_initiate ? '200' : '500'} chardes
                {!char.is_initiate && ' (200 si initié)'}
              </p>
            </button>

            {/* Initiation divine */}
            <button
              onClick={async () => {
                if (char.is_initiate || !char.god || char.god === 'Aucun' || char.money < 100) return;
                await api.updateCharacter(Number(id), { is_initiate: true, money: char.money - 100 });
                setChar({ ...char, is_initiate: true, money: char.money - 100 });
              }}
              disabled={char.is_initiate || !char.god || char.god === 'Aucun' || char.money < 100 || char.is_dead}
              className="p-3 rounded-lg border border-parchment-600 hover:border-yellow-600 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-medieval text-yellow-400">Initiation divine</p>
              <p className="text-xs text-parchment-400">
                {char.is_initiate
                  ? `Initié de ${char.god}`
                  : char.god && char.god !== 'Aucun'
                    ? `Devenir initié de ${char.god}`
                    : 'Choisissez d\'abord une divinité'}
              </p>
              <p className="text-xs text-parchment-500 mt-1">Coût : 100 chardes</p>
            </button>
          </div>

          {/* Indicateurs d'état */}
          <div className="flex flex-wrap gap-2 mt-3">
            {char.resurrection_arrangement && (
              <span className="px-2 py-1 bg-purple-900/50 rounded text-xs text-purple-300 border border-purple-700">
                Résurrection : {char.resurrection_arrangement}
              </span>
            )}
            {char.is_initiate && char.god && (
              <span className="px-2 py-1 bg-yellow-900/50 rounded text-xs text-yellow-300 border border-yellow-700">
                Initié de {char.god}
              </span>
            )}
            {char.is_dead && (
              <span className="px-2 py-1 bg-red-900/50 rounded text-xs text-red-300 border border-red-700">
                MORT
              </span>
            )}
          </div>
        </div>
      )}

      {/* Codewords, Titles, Blessings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="parchment-card">
          <h3 className="font-medieval text-lg text-fantasy-gold mb-2">Coche-mots</h3>
          {(char.codewords || []).length === 0 ? (
            <p className="text-parchment-500 text-sm italic">Aucun</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(char.codewords || []).map((cw: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-parchment-700/50 rounded text-sm text-parchment-100">{cw}</span>
              ))}
            </div>
          )}
        </div>
        <div className="parchment-card">
          <h3 className="font-medieval text-lg text-fantasy-gold mb-2">Titres</h3>
          {(char.titles || []).length === 0 ? (
            <p className="text-parchment-500 text-sm italic">Aucun</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(char.titles || []).map((t: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-fantasy-gold/20 rounded text-sm text-parchment-100 font-semibold">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="parchment-card">
          <h3 className="font-medieval text-lg text-fantasy-gold mb-2">Bénédictions</h3>
          {(char.blessings || []).length === 0 ? (
            <p className="text-parchment-500 text-sm italic">Aucune</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(char.blessings || []).map((b: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-purple-900/50 rounded text-sm text-parchment-100">{b}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Combat Statistics */}
      {combatLogs.length > 0 && (
        <div className="parchment-card">
          <h3 className="section-title">Statistiques de combat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="font-medieval text-2xl text-fantasy-gold">{combatLogs.length}</p>
              <p className="text-parchment-300 text-sm">Combats</p>
            </div>
            <div className="text-center">
              <p className="font-medieval text-2xl text-green-400">{combatLogs.filter(l => l.result === 'player').length}</p>
              <p className="text-parchment-300 text-sm">Victoires</p>
            </div>
            <div className="text-center">
              <p className="font-medieval text-2xl text-fantasy-red">{combatLogs.filter(l => l.result === 'enemy').length}</p>
              <p className="text-parchment-300 text-sm">Défaites</p>
            </div>
            <div className="text-center">
              <p className="font-medieval text-2xl text-fantasy-gold">
                {combatLogs.length > 0 ? Math.round((combatLogs.filter(l => l.result === 'player').length / combatLogs.length) * 100) : 0}%
              </p>
              <p className="text-parchment-300 text-sm">Taux victoire</p>
            </div>
          </div>
          <h4 className="font-medieval text-lg text-fantasy-gold mb-2">Derniers combats</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {combatLogs.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-2 bg-parchment-800/50 rounded border border-parchment-600 text-sm">
                <div>
                  <span className="text-parchment-100 font-semibold">vs {log.enemy_name}</span>
                  <span className="text-parchment-400 text-xs ml-2">(DEF {log.enemy_defence}, END {log.enemy_stamina})</span>
                </div>
                <span className={`font-medieval text-sm ${log.result === 'player' ? 'text-green-400' : 'text-fantasy-red'}`}>
                  {log.result === 'player' ? 'Victoire' : 'Défaite'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Progress */}
      {Object.values(bookProgress).some(v => v > 0) && (
        <div className="parchment-card">
          <h3 className="section-title">Progression par livre</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {books.map(book => {
              const visited = bookProgress[book.id] || 0;
              if (visited === 0) return null;
              const percent = Math.round((visited / book.maxCode) * 100);
              return (
                <div key={book.id} className="p-3 rounded-lg border border-parchment-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: book.color }}
                    >
                      {book.id}
                    </span>
                    <span className="text-parchment-100 text-sm font-medieval">{book.region}</span>
                  </div>
                  <div className="w-full bg-parchment-700/30 rounded-full h-2 mb-1">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${percent}%`, backgroundColor: book.color }}
                    />
                  </div>
                  <p className="text-parchment-400 text-xs">{visited}/{book.maxCode} codes ({percent}%)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes & Backstory */}
      <div className="parchment-card">
        <h3 className="section-title">Notes & Histoire</h3>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-parchment-200 font-semibold block mb-1">Histoire</label>
              <textarea
                value={editData.backstory || ''}
                onChange={e => setEditData({ ...editData, backstory: e.target.value })}
                className="fantasy-input h-24 resize-y"
              />
            </div>
            <div>
              <label className="text-sm text-parchment-200 font-semibold block mb-1">Notes</label>
              <textarea
                value={editData.notes || ''}
                onChange={e => setEditData({ ...editData, notes: e.target.value })}
                className="fantasy-input h-24 resize-y"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {char.backstory && (
              <div>
                <p className="text-sm font-semibold text-parchment-300 mb-1">Histoire</p>
                <p className="text-parchment-100 font-body">{char.backstory}</p>
              </div>
            )}
            {char.notes && (
              <div>
                <p className="text-sm font-semibold text-parchment-300 mb-1">Notes</p>
                <p className="text-parchment-100 font-body whitespace-pre-wrap">{char.notes}</p>
              </div>
            )}
            {!char.backstory && !char.notes && (
              <p className="text-parchment-500 italic">Aucune note pour le moment.</p>
            )}
          </div>
        )}
      </div>
      {/* Modal de progression de rang */}
      <AnimatePresence>
        {showRankModal && pendingRank && char && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-parchment-900 border-2 border-fantasy-gold rounded-lg p-6 max-w-lg w-full space-y-4"
            >
              <h3 className="font-medieval text-xl text-fantasy-gold text-center">
                Progression au Rang {pendingRank}
              </h3>
              <p className="text-parchment-300 text-sm text-center">
                Voulez-vous recalculer les compétences selon les tables officielles pour un {char.profession} de Rang {pendingRank} ?
              </p>

              {(() => {
                const getRankRange = (r: number): RankRange => {
                  if (r <= 2) return '1-2';
                  if (r <= 4) return '3-4';
                  if (r <= 6) return '5-6';
                  if (r <= 8) return '7-8';
                  return '9-10';
                };
                const profession = char.profession as keyof typeof statsTable;
                const table = statsTable[profession];
                if (!table) return <p className="text-parchment-400">Profession inconnue</p>;
                const newStats = table[getRankRange(pendingRank)];
                const oldStats = table[getRankRange(char.rank)];

                const statKeys = [
                  { key: 'combat', label: 'COMBAT' },
                  { key: 'charisma', label: 'CHARISME' },
                  { key: 'magic', label: 'MAGIE' },
                  { key: 'sanctity', label: 'PIÉTÉ' },
                  { key: 'scouting', label: 'EXPLORATION' },
                  { key: 'thievery', label: 'ADRESSE' },
                  { key: 'defence', label: 'DÉFENSE' },
                  { key: 'stamina', label: 'ENDURANCE' },
                ];

                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1 text-sm font-semibold text-parchment-400 px-2">
                      <span>Compétence</span>
                      <span className="text-center">Actuel</span>
                      <span className="text-center">Nouveau</span>
                    </div>
                    {statKeys.map(({ key, label }) => {
                      const oldVal = oldStats[key as keyof typeof oldStats];
                      const newVal = newStats[key as keyof typeof newStats];
                      const diff = newVal - oldVal;
                      return (
                        <div key={key} className="grid grid-cols-3 gap-1 text-sm px-2 py-1 bg-parchment-800/30 rounded">
                          <span className="text-parchment-200">{label}</span>
                          <span className="text-center text-parchment-400">{oldVal}</span>
                          <span className={`text-center font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-fantasy-red' : 'text-parchment-400'}`}>
                            {newVal} {diff > 0 && `(+${diff})`}{diff < 0 && `(${diff})`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const getRankRange = (r: number): RankRange => {
                      if (r <= 2) return '1-2';
                      if (r <= 4) return '3-4';
                      if (r <= 6) return '5-6';
                      if (r <= 8) return '7-8';
                      return '9-10';
                    };
                    const profession = char.profession as keyof typeof statsTable;
                    const newStats = statsTable[profession]?.[getRankRange(pendingRank)];
                    if (newStats) {
                      setEditData({
                        ...editData,
                        rank: pendingRank,
                        combat: newStats.combat,
                        charisma: newStats.charisma,
                        magic: newStats.magic,
                        sanctity: newStats.sanctity,
                        scouting: newStats.scouting,
                        thievery: newStats.thievery,
                        defence: newStats.defence,
                        stamina: newStats.stamina,
                        max_stamina: newStats.stamina,
                      });
                    }
                    setShowRankModal(false);
                    setPendingRank(null);
                  }}
                  className="flex-1 fantasy-button text-center"
                >
                  Appliquer les stats officielles
                </button>
                <button
                  onClick={() => {
                    setShowRankModal(false);
                    setPendingRank(null);
                  }}
                  className="flex-1 px-4 py-2 rounded font-medieval bg-parchment-700 text-parchment-200 border border-parchment-500 hover:bg-parchment-600 transition-all text-center text-sm"
                >
                  Garder les stats actuelles
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Catalogue d'équipement */}
      <AnimatePresence>
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCatalog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-parchment-900 border-2 border-fantasy-gold rounded-lg p-6 max-w-2xl w-full max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medieval text-xl text-fantasy-gold">Catalogue d'équipement</h3>
                <button onClick={() => setShowCatalog(false)} className="text-parchment-400 hover:text-parchment-200 text-xl">&times;</button>
              </div>

              {/* Filtres par type */}
              <div className="flex gap-2 mb-4">
                {([['tous', 'Tous'], ['arme', 'Armes'], ['armure', 'Armures'], ['objet', 'Objets']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCatalogFilter(key)}
                    className={`px-3 py-1 rounded font-medieval text-sm transition-all ${
                      catalogFilter === key
                        ? 'bg-fantasy-gold/20 text-fantasy-gold border border-fantasy-gold/50'
                        : 'bg-parchment-800/50 text-parchment-400 border border-parchment-600 hover:border-parchment-500'
                    }`}
                  >{label}</button>
                ))}
              </div>

              {/* Liste scrollable */}
              <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                {(() => {
                  const items = catalogFilter === 'tous' ? allEquipment : allEquipment.filter(e => e.type === catalogFilter);
                  const groups: Record<string, EquipmentItem[]> = {};
                  for (const item of items) {
                    const cat = item.type === 'arme' ? 'Armes' : item.type === 'armure' ? 'Armures' : 'Objets';
                    (groups[cat] ||= []).push(item);
                  }
                  return ['Armes', 'Armures', 'Objets'].map(cat => {
                    const catItems = groups[cat];
                    if (!catItems || catItems.length === 0) return null;
                    return (
                      <div key={cat} className="mb-4">
                        <h4 className="font-medieval text-lg text-fantasy-gold mb-2 border-b border-fantasy-gold/30 pb-1">
                          {cat} ({catItems.length})
                        </h4>
                        <div className="space-y-1">
                          {catItems.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-start justify-between p-2 rounded hover:bg-parchment-800/50 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-body text-parchment-100 font-semibold">{item.name}</span>
                                  {item.bonus && (
                                    <span className="px-1.5 py-0.5 rounded bg-fantasy-gold/15 text-fantasy-gold text-xs font-bold">
                                      +{item.bonus.value} {statLabels[item.bonus.stat] || item.bonus.stat}
                                    </span>
                                  )}
                                  {!item.bonus && (
                                    <span className="px-1.5 py-0.5 rounded bg-parchment-700/50 text-parchment-500 text-xs">
                                      pas de bonus
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-parchment-400 mt-0.5">{item.description}</p>
                                )}
                              </div>
                              {editing && (editData.equipment || []).length < 12 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditData({ ...editData, equipment: [...(editData.equipment || []), item] });
                                  }}
                                  className="ml-2 px-2 py-1 rounded bg-green-900/50 text-green-400 border border-green-700 hover:bg-green-800/50 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >+ Ajouter</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
