import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { Character, EquipmentItem } from '../data/types';

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
          };
          setChar(parsed);
          setEditData(parsed);
        })
        .catch(() => navigate('/'));
    }
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateCharacter(Number(id), editData);
      setChar({ ...char, ...editData });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Supprimer ce personnage définitivement ?')) return;
    await api.deleteCharacter(Number(id));
    navigate('/');
  };

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
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-3xl shadow-lg animate-breathe">
              {char.name[0]}
            </div>
            <div>
              {editing ? (
                <input
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="fantasy-input text-xl font-medieval"
                />
              ) : (
                <h2 className="font-medieval text-3xl text-fantasy-brown">{char.name}</h2>
              )}
              <p className="text-parchment-600">{char.profession} - Rang {char.rank}</p>
              {char.god && <p className="text-parchment-500 text-sm italic">Divinité : {char.god}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="fantasy-button text-sm">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button onClick={() => { setEditing(false); setEditData(char); }} className="fantasy-button-danger text-sm">
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
          {Object.entries(statLabels).map(([key, label]) => (
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
                  char[key]
                )}
              </div>
              <span className="font-body text-parchment-700 text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vital Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="parchment-card">
          <h3 className="section-title">Stats vitales</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-body text-parchment-700 font-semibold">Endurance</span>
              {editing ? (
                <div className="flex gap-1 items-center">
                  <input type="number" value={editData.stamina} onChange={e => setEditData({ ...editData, stamina: Number(e.target.value) })} className="fantasy-input w-16 text-center text-sm" />
                  <span className="text-parchment-500">/</span>
                  <input type="number" value={editData.max_stamina} onChange={e => setEditData({ ...editData, max_stamina: Number(e.target.value) })} className="fantasy-input w-16 text-center text-sm" />
                </div>
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">{char.stamina} / {char.max_stamina}</span>
              )}
            </div>
            <div className="w-full bg-parchment-400/30 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-fantasy-red to-fantasy-gold transition-all duration-500"
                style={{ width: `${(char.stamina / char.max_stamina) * 100}%` }}
              />
            </div>
            <div className="flex justify-between">
              <span className="font-body text-parchment-700 font-semibold">Défense</span>
              {editing ? (
                <input type="number" value={editData.defence} onChange={e => setEditData({ ...editData, defence: Number(e.target.value) })} className="fantasy-input w-16 text-center text-sm" />
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">{char.defence}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="font-body text-parchment-700 font-semibold">Argent (chardes)</span>
              {editing ? (
                <input type="number" value={editData.money} onChange={e => setEditData({ ...editData, money: Number(e.target.value) })} className="fantasy-input w-16 text-center text-sm" />
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">{char.money}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="font-body text-parchment-700 font-semibold">Rang</span>
              {editing ? (
                <input type="number" value={editData.rank} onChange={e => setEditData({ ...editData, rank: Number(e.target.value) })} className="fantasy-input w-16 text-center text-sm" min={1} max={10} />
              ) : (
                <span className="font-medieval text-xl text-fantasy-gold">{char.rank}</span>
              )}
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="parchment-card">
          <h3 className="section-title">Équipement ({(char.equipment || []).length}/12)</h3>
          <div className="space-y-2">
            {(char.equipment || []).length === 0 ? (
              <p className="text-parchment-500 italic">Aucun équipement</p>
            ) : (
              (char.equipment || []).map((item: EquipmentItem, i: number) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-parchment-300/50 last:border-0">
                  <div>
                    <span className="font-body text-parchment-800">{item.name}</span>
                    {item.bonus && (
                      <span className="text-xs text-fantasy-gold ml-2">(+{item.bonus.value} {item.bonus.stat})</span>
                    )}
                  </div>
                  <span className="text-xs text-parchment-500 capitalize">{item.type}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Codewords, Titles, Blessings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="parchment-card">
          <h3 className="font-medieval text-lg text-fantasy-brown mb-2">Coche-mots</h3>
          {(char.codewords || []).length === 0 ? (
            <p className="text-parchment-500 text-sm italic">Aucun</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(char.codewords || []).map((cw: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-parchment-300/50 rounded text-sm text-parchment-800">{cw}</span>
              ))}
            </div>
          )}
        </div>
        <div className="parchment-card">
          <h3 className="font-medieval text-lg text-fantasy-brown mb-2">Titres</h3>
          {(char.titles || []).length === 0 ? (
            <p className="text-parchment-500 text-sm italic">Aucun</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(char.titles || []).map((t: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-fantasy-gold/20 rounded text-sm text-parchment-800 font-semibold">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="parchment-card">
          <h3 className="font-medieval text-lg text-fantasy-brown mb-2">Bénédictions</h3>
          {(char.blessings || []).length === 0 ? (
            <p className="text-parchment-500 text-sm italic">Aucune</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(char.blessings || []).map((b: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-purple-200/50 rounded text-sm text-parchment-800">{b}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes & Backstory */}
      <div className="parchment-card">
        <h3 className="section-title">Notes & Histoire</h3>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-parchment-700 font-semibold block mb-1">Histoire</label>
              <textarea
                value={editData.backstory || ''}
                onChange={e => setEditData({ ...editData, backstory: e.target.value })}
                className="fantasy-input h-24 resize-y"
              />
            </div>
            <div>
              <label className="text-sm text-parchment-700 font-semibold block mb-1">Notes</label>
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
                <p className="text-sm font-semibold text-parchment-600 mb-1">Histoire</p>
                <p className="text-parchment-800 font-body">{char.backstory}</p>
              </div>
            )}
            {char.notes && (
              <div>
                <p className="text-sm font-semibold text-parchment-600 mb-1">Notes</p>
                <p className="text-parchment-800 font-body whitespace-pre-wrap">{char.notes}</p>
              </div>
            )}
            {!char.backstory && !char.notes && (
              <p className="text-parchment-500 italic">Aucune note pour le moment.</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
