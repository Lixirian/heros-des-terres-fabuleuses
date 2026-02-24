import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { Character } from '../data/types';
import { Enemy, CombatState, initCombat, resolveRound, getEquipmentBonus } from '../utils/combatResolver';
import { roll2d6, skillTest, SkillTestResult } from '../utils/diceRoller';
import DiceAnimation from '../components/combat/DiceAnimation';

const statLabels: Record<string, string> = {
  combat: 'COMBAT',
  charisma: 'CHARISME',
  magic: 'MAGIE',
  sanctity: 'PIÉTÉ',
  scouting: 'EXPLORATION',
  thievery: 'ADRESSE',
};

export default function CombatHelper() {
  const { characterId } = useParams();
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedChar, setSelectedChar] = useState<any | null>(null);
  const [mode, setMode] = useState<'combat' | 'test'>('combat');

  // Combat state
  const [enemyName, setEnemyName] = useState('');
  const [enemyCombat, setEnemyCombat] = useState(5);
  const [enemyDefence, setEnemyDefence] = useState(5);
  const [enemyStamina, setEnemyStamina] = useState(10);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [rolling, setRolling] = useState(false);
  const [lastDice, setLastDice] = useState<[number, number] | null>(null);

  // Skill test state
  const [testSkill, setTestSkill] = useState('combat');
  const [testDifficulty, setTestDifficulty] = useState(9);
  const [testBonus, setTestBonus] = useState(0);
  const [testResult, setTestResult] = useState<SkillTestResult | null>(null);
  const [testRolling, setTestRolling] = useState(false);

  useEffect(() => {
    api.getCharacters().then(chars => {
      setCharacters(chars);
      if (characterId) {
        const c = chars.find((ch: any) => ch.id === Number(characterId));
        if (c) selectChar(c);
      }
    });
  }, [characterId]);

  const selectChar = (char: any) => {
    const parsed = {
      ...char,
      equipment: typeof char.equipment === 'string' ? JSON.parse(char.equipment) : char.equipment || [],
      blessings: typeof char.blessings === 'string' ? JSON.parse(char.blessings) : char.blessings || [],
    };
    setSelectedChar(parsed);
  };

  const startCombat = () => {
    if (!selectedChar || !enemyName) return;
    const enemy: Enemy = { name: enemyName, combat: enemyCombat, defence: enemyDefence, stamina: enemyStamina };
    setCombatState(initCombat(selectedChar, enemy));
  };

  const nextRound = useCallback(() => {
    if (!selectedChar || !combatState || combatState.finished) return;
    setRolling(true);
    const dice = roll2d6();
    setLastDice(dice);

    setTimeout(() => {
      const enemy: Enemy = { name: enemyName, combat: enemyCombat, defence: enemyDefence, stamina: enemyStamina };
      const newState = resolveRound(selectedChar, enemy, combatState);
      setCombatState(newState);
      setRolling(false);

      // Update character stamina if changed
      if (newState.playerStamina !== selectedChar.stamina && selectedChar.id) {
        api.updateCharacter(selectedChar.id, { stamina: newState.playerStamina });
        setSelectedChar({ ...selectedChar, stamina: newState.playerStamina });
      }

      // Save combat log when finished
      if (newState.finished && selectedChar.id) {
        api.saveCombatLog(selectedChar.id, {
          enemy_name: enemyName,
          enemy_defence: enemyDefence,
          enemy_stamina: enemyStamina,
          result: newState.winner,
          rounds: newState.rounds,
        });
      }
    }, 800);
  }, [selectedChar, combatState, enemyName, enemyCombat, enemyDefence, enemyStamina]);

  const resetCombat = () => {
    setCombatState(null);
    setLastDice(null);
  };

  const runSkillTest = () => {
    if (!selectedChar) return;
    setTestRolling(true);
    setTimeout(() => {
      const skillValue = selectedChar[testSkill] || 0;
      const equipBonus = getEquipmentBonus(selectedChar, testSkill);
      const result = skillTest(skillValue, testDifficulty, testBonus + equipBonus);
      setTestResult(result);
      setTestRolling(false);
    }, 800);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <h2 className="font-medieval text-3xl text-fantasy-gold">Assistant de combat</h2>

      {/* Character Selection */}
      {!selectedChar && (
        <div className="parchment-card">
          <h3 className="section-title">Choisir un personnage</h3>
          {characters.length === 0 ? (
            <p className="text-parchment-300">Aucun personnage. Créez-en un d'abord.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {characters.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => selectChar(c)}
                  className="p-3 rounded-lg border-2 border-parchment-600 hover:border-fantasy-gold transition-all text-left"
                >
                  <p className="font-medieval text-fantasy-gold">{c.name}</p>
                  <p className="text-xs text-parchment-300">{c.profession} - Rang {c.rank} - END: {c.stamina}/{c.max_stamina}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedChar && (
        <>
          {/* Active Character Banner */}
          <div className="parchment-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fantasy-gold to-parchment-400 flex items-center justify-center text-parchment-900 font-medieval text-xl">
                {selectedChar.name[0]}
              </div>
              <div>
                <p className="font-medieval text-xl text-fantasy-gold">{selectedChar.name}</p>
                <p className="text-sm text-parchment-300">
                  COM: {selectedChar.combat} | DEF: {selectedChar.defence} | END: {selectedChar.stamina}/{selectedChar.max_stamina}
                </p>
              </div>
            </div>
            <button onClick={() => { setSelectedChar(null); resetCombat(); }} className="text-sm text-parchment-500 hover:text-fantasy-red">
              Changer
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button onClick={() => setMode('combat')} className={`px-4 py-2 rounded font-medieval text-sm ${mode === 'combat' ? 'bg-fantasy-gold text-parchment-900' : 'bg-parchment-800 text-parchment-400'}`}>
              Combat
            </button>
            <button onClick={() => setMode('test')} className={`px-4 py-2 rounded font-medieval text-sm ${mode === 'test' ? 'bg-fantasy-gold text-parchment-900' : 'bg-parchment-800 text-parchment-400'}`}>
              Test de compétence
            </button>
          </div>

          {mode === 'combat' ? (
            <>
              {/* Enemy Setup or Combat */}
              {!combatState ? (
                <div className="parchment-card space-y-4">
                  <h3 className="section-title">Configurer l'ennemi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-parchment-200 mb-1 font-semibold">Nom de l'ennemi</label>
                      <input value={enemyName} onChange={e => setEnemyName(e.target.value)} className="fantasy-input" placeholder="Ex: Gobelin" />
                    </div>
                    <div>
                      <label className="block text-sm text-parchment-200 mb-1 font-semibold">COMBAT</label>
                      <input type="number" value={enemyCombat} onChange={e => setEnemyCombat(Number(e.target.value))} className="fantasy-input" min={1} />
                    </div>
                    <div>
                      <label className="block text-sm text-parchment-200 mb-1 font-semibold">Défense</label>
                      <input type="number" value={enemyDefence} onChange={e => setEnemyDefence(Number(e.target.value))} className="fantasy-input" min={1} />
                    </div>
                    <div>
                      <label className="block text-sm text-parchment-200 mb-1 font-semibold">Endurance</label>
                      <input type="number" value={enemyStamina} onChange={e => setEnemyStamina(Number(e.target.value))} className="fantasy-input" min={1} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={startCombat} disabled={!enemyName} className="fantasy-button flex-1 text-center">
                      Commencer le combat !
                    </button>
                    <button
                      onClick={() => { setSelectedChar(null); setEnemyName(''); setEnemyCombat(5); setEnemyDefence(5); setEnemyStamina(10); resetCombat(); }}
                      className="fantasy-button-danger text-center px-6"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Combat Arena */}
                  <div className="parchment-card">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <p className="font-medieval text-lg text-fantasy-gold">{selectedChar.name}</p>
                        <p className="text-2xl font-bold text-fantasy-gold">{combatState.playerStamina}</p>
                        <p className="text-xs text-parchment-300">Endurance</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medieval text-2xl text-fantasy-red">VS</p>
                        <p className="text-sm text-parchment-300">Round {combatState.rounds.length + (combatState.finished ? 0 : 1)}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medieval text-lg text-fantasy-gold">{enemyName}</p>
                        <p className="text-2xl font-bold text-fantasy-red">{combatState.enemyStamina}</p>
                        <p className="text-xs text-parchment-300">Endurance</p>
                      </div>
                    </div>

                    {/* Dice Display */}
                    <div className="flex justify-center gap-6 my-6">
                      <DiceAnimation rolling={rolling} value={lastDice?.[0] ?? 0} />
                      <DiceAnimation rolling={rolling} value={lastDice?.[1] ?? 0} />
                    </div>

                    {/* Action Buttons */}
                    {combatState.finished ? (
                      <div className="text-center space-y-3">
                        <p className={`font-medieval text-2xl ${combatState.winner === 'player' ? 'text-green-400' : 'text-fantasy-red'}`}>
                          {combatState.winner === 'player' ? 'Victoire !' : 'Défaite...'}
                        </p>
                        <button onClick={resetCombat} className="fantasy-button">Nouveau combat</button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button onClick={nextRound} disabled={rolling} className="fantasy-button w-full text-center text-lg">
                          {rolling ? 'Lancer des dés...' : 'Lancer le round !'}
                        </button>
                        <button onClick={resetCombat} className="fantasy-button-danger w-full text-center text-sm">
                          Abandonner le combat
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Combat Log */}
                  {combatState.rounds.length > 0 && (
                    <div className="parchment-card">
                      <h3 className="section-title">Historique des rounds</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {[...combatState.rounds].reverse().map(round => (
                          <div key={round.round} className="p-3 bg-parchment-800/50 rounded border border-parchment-600 text-sm">
                            <p className="font-semibold text-parchment-100">Round {round.round}</p>
                            <p className="text-parchment-200">
                              {selectedChar.name}: [{round.playerRoll.join(', ')}] + {selectedChar.combat} = {round.playerTotal} → {round.playerDamage} dégâts
                            </p>
                            <p className="text-parchment-200">
                              {enemyName}: [{round.enemyRoll.join(', ')}] + {enemyCombat} = {round.enemyTotal} → {round.enemyDamage} dégâts
                            </p>
                            <p className="text-xs text-parchment-500">
                              END: {selectedChar.name} {round.playerStamina} | {enemyName} {round.enemyStamina}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Skill Test Mode */
            <div className="parchment-card space-y-4">
              <h3 className="section-title">Test de compétence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-parchment-200 mb-1 font-semibold">Compétence</label>
                  <select value={testSkill} onChange={e => setTestSkill(e.target.value)} className="fantasy-input">
                    {Object.entries(statLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label} ({selectedChar[key]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-parchment-200 mb-1 font-semibold">Difficulté</label>
                  <input type="number" value={testDifficulty} onChange={e => setTestDifficulty(Number(e.target.value))} className="fantasy-input" min={2} />
                </div>
                <div>
                  <label className="block text-sm text-parchment-200 mb-1 font-semibold">Bonus</label>
                  <input type="number" value={testBonus} onChange={e => setTestBonus(Number(e.target.value))} className="fantasy-input" />
                </div>
              </div>

              <button onClick={runSkillTest} disabled={testRolling} className="fantasy-button w-full text-center">
                {testRolling ? 'Lancer...' : 'Tester !'}
              </button>

              <AnimatePresence>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-lg border-2 text-center ${testResult.success ? 'border-green-600 bg-green-900/30' : 'border-red-600 bg-red-900/30'}`}
                  >
                    <p className="font-medieval text-2xl mb-2">
                      {testResult.success ? 'Réussite !' : 'Échec !'}
                    </p>
                    <p className="text-parchment-200">
                      [{testResult.dice.join(', ')}] ({testResult.diceTotal}) + {testResult.skillValue}
                      {testResult.bonus > 0 && ` + ${testResult.bonus}`} = <span className="font-bold">{testResult.total}</span>
                      {' '}vs difficulté {testResult.difficulty}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
