import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { Character } from '../data/types';
import { Enemy, CombatState, initCombat, resolveRound, resolveFlee, getEquipmentBonus, getAvailableReroll, getBlessingDefenceBonus } from '../utils/combatResolver';
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
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [initialStamina, setInitialStamina] = useState<number | null>(null);
  const [canUseReroll, setCanUseReroll] = useState(false);
  const [rerollBlessing, setRerollBlessing] = useState<string | null>(null);
  const [pendingRerollState, setPendingRerollState] = useState<CombatState | null>(null);

  // Skill test state
  const [testSkill, setTestSkill] = useState('combat');
  const [testDifficulty, setTestDifficulty] = useState(9);
  const [testBonus, setTestBonus] = useState(0);
  const [testResult, setTestResult] = useState<SkillTestResult | null>(null);
  const [testRolling, setTestRolling] = useState(false);
  const [testRerollAvailable, setTestRerollAvailable] = useState<string | null>(null);
  const [testRerollUsed, setTestRerollUsed] = useState(false);

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
    setInitialStamina(selectedChar.stamina);
    setCombatState(initCombat(selectedChar, enemy));
  };

  /** Consomme une bénédiction (supprime de la liste et sauvegarde en BDD) */
  const consumeBlessing = useCallback(async (blessingName: string) => {
    if (!selectedChar?.id) return;
    const updatedBlessings = selectedChar.blessings.filter((b: string) => b !== blessingName);
    await api.updateCharacter(selectedChar.id, { blessings: updatedBlessings });
    setSelectedChar({ ...selectedChar, blessings: updatedBlessings });
  }, [selectedChar]);

  /** Applique le résultat d'un round (mise à jour endurance, log, mort) */
  const applyRoundResult = useCallback((newState: CombatState) => {
    setCombatState(newState);
    setCanUseReroll(false);
    setRerollBlessing(null);
    setPendingRerollState(null);

    if (newState.playerStamina !== selectedChar?.stamina && selectedChar?.id) {
      api.updateCharacter(selectedChar.id, { stamina: newState.playerStamina });
      setSelectedChar({ ...selectedChar, stamina: newState.playerStamina });
    }

    if (newState.finished && selectedChar?.id) {
      api.saveCombatLog(selectedChar.id, {
        enemy_name: enemyName,
        enemy_defence: enemyDefence,
        enemy_stamina: enemyStamina,
        result: newState.winner,
        rounds: newState.rounds,
      });
      if (newState.winner === 'enemy' && newState.playerStamina <= 0) {
        setShowDeathModal(true);
      }
    }
  }, [selectedChar, enemyName, enemyDefence, enemyStamina]);

  const nextRound = useCallback(() => {
    if (!selectedChar || !combatState || combatState.finished) return;
    setRolling(true);
    const dice = roll2d6();
    setLastDice(dice);

    setTimeout(() => {
      const enemy: Enemy = { name: enemyName, combat: enemyCombat, defence: enemyDefence, stamina: enemyStamina };
      const newState = resolveRound(selectedChar, enemy, combatState);
      setRolling(false);

      // Vérifier si une relance est possible (bénédiction Combat ou Chance)
      const lastRound = newState.rounds[newState.rounds.length - 1];
      const available = getAvailableReroll(selectedChar, 'combat');
      // Proposer la relance si le round est défavorable (joueur prend des dégâts et/ou n'en inflige pas)
      if (available && lastRound && (lastRound.playerDamage === 0 || lastRound.enemyDamage > 0)) {
        setPendingRerollState(newState);
        setRerollBlessing(available);
        setCanUseReroll(true);
        setCombatState(newState);
      } else {
        applyRoundResult(newState);
      }
    }, 800);
  }, [selectedChar, combatState, enemyName, enemyCombat, enemyDefence, enemyStamina, applyRoundResult]);

  /** Fuite : l'ennemi a une attaque gratuite, puis le combat se termine */
  const handleFlee = useCallback(() => {
    if (!selectedChar || !combatState || combatState.finished) return;
    setRolling(true);
    const dice = roll2d6();
    setLastDice(dice);

    setTimeout(() => {
      const enemy: Enemy = { name: enemyName, combat: enemyCombat, defence: enemyDefence, stamina: enemyStamina };
      const newState = resolveFlee(selectedChar, enemy, combatState);
      setCombatState(newState);
      setRolling(false);

      // Mettre à jour l'endurance (dégâts de l'attaque gratuite)
      if (newState.playerStamina !== selectedChar.stamina && selectedChar.id) {
        api.updateCharacter(selectedChar.id, { stamina: newState.playerStamina });
        setSelectedChar({ ...selectedChar, stamina: newState.playerStamina });
      }

      // Sauvegarder le log avec résultat "fled"
      if (selectedChar.id) {
        api.saveCombatLog(selectedChar.id, {
          enemy_name: enemyName,
          enemy_defence: enemyDefence,
          enemy_stamina: enemyStamina,
          result: newState.winner,
          rounds: newState.rounds,
        });
        // Si le joueur meurt en fuyant (attaque gratuite fatale)
        if (newState.playerStamina <= 0) {
          setShowDeathModal(true);
        }
      }
    }, 800);
  }, [selectedChar, combatState, enemyName, enemyCombat, enemyDefence, enemyStamina]);

  /** Relancer les dés (consomme la bénédiction) */
  const handleReroll = useCallback(async () => {
    if (!selectedChar || !combatState || !pendingRerollState || !rerollBlessing) return;

    // Consommer la bénédiction
    await consumeBlessing(rerollBlessing);

    setCanUseReroll(false);
    setRolling(true);

    setTimeout(() => {
      // Retirer le dernier round et relancer
      const stateBeforeRound: CombatState = {
        ...combatState,
        rounds: combatState.rounds.slice(0, -1),
        playerStamina: pendingRerollState.rounds.length > 1
          ? pendingRerollState.rounds[pendingRerollState.rounds.length - 2].playerStamina
          : initialStamina ?? selectedChar.stamina,
        enemyStamina: pendingRerollState.rounds.length > 1
          ? pendingRerollState.rounds[pendingRerollState.rounds.length - 2].enemyStamina
          : enemyStamina,
        finished: false,
        winner: null,
      };
      const enemy: Enemy = { name: enemyName, combat: enemyCombat, defence: enemyDefence, stamina: enemyStamina };
      const newState = resolveRound(selectedChar, enemy, stateBeforeRound);
      const newDice = newState.rounds[newState.rounds.length - 1].playerRoll as [number, number];
      setLastDice(newDice);
      setRolling(false);
      setPendingRerollState(null);
      setRerollBlessing(null);
      applyRoundResult(newState);
    }, 800);
  }, [selectedChar, combatState, pendingRerollState, rerollBlessing, initialStamina, enemyName, enemyCombat, enemyDefence, enemyStamina, applyRoundResult, consumeBlessing]);

  /** Accepter le round sans relancer */
  const acceptRound = useCallback(() => {
    if (pendingRerollState) {
      applyRoundResult(pendingRerollState);
    }
  }, [pendingRerollState, applyRoundResult]);

  /** Annuler : supprime tout le combat, remet l'endurance d'avant, aucune trace */
  const handleCancel = () => {
    if (selectedChar?.id && initialStamina !== null) {
      api.updateCharacter(selectedChar.id, { stamina: initialStamina });
    }
    setCombatState(null);
    setLastDice(null);
    setEnemyName('');
    setEnemyCombat(5);
    setEnemyDefence(5);
    setEnemyStamina(10);
    setInitialStamina(null);
    setCanUseReroll(false);
    setRerollBlessing(null);
    setPendingRerollState(null);
    setSelectedChar(null);
  };

  /** Résurrection : le personnage revient avec pénalités selon les règles officielles */
  const handleResurrection = async () => {
    if (!selectedChar?.id) return;
    await api.updateCharacter(selectedChar.id, {
      stamina: selectedChar.max_stamina,
      money: 0,
      equipment: [],
      resurrection_arrangement: null,
      is_dead: false,
    });
    setSelectedChar({
      ...selectedChar,
      stamina: selectedChar.max_stamina,
      money: 0,
      equipment: [],
      resurrection_arrangement: null,
      is_dead: false,
    });
    setShowDeathModal(false);
    setCombatState(null);
    setLastDice(null);
  };

  /** Mort définitive : marquer le personnage comme mort */
  const handlePermanentDeath = async () => {
    if (!selectedChar?.id) return;
    await api.updateCharacter(selectedChar.id, { is_dead: true, stamina: 0 });
    setSelectedChar({ ...selectedChar, is_dead: true, stamina: 0 });
    setShowDeathModal(false);
    setCombatState(null);
    setLastDice(null);
    setSelectedChar(null);
  };

  const resetCombat = () => {
    setCombatState(null);
    setLastDice(null);
    setInitialStamina(null);
    setCanUseReroll(false);
    setRerollBlessing(null);
    setPendingRerollState(null);
  };

  /** Test de compétence avec gestion des bénédictions */
  const runSkillTest = () => {
    if (!selectedChar) return;
    setTestRolling(true);
    setTestRerollAvailable(null);
    setTestRerollUsed(false);
    setTimeout(() => {
      const skillValue = selectedChar[testSkill] || 0;
      const equipBonus = getEquipmentBonus(selectedChar, testSkill);
      const result = skillTest(skillValue, testDifficulty, testBonus + equipBonus);
      setTestResult(result);
      setTestRolling(false);

      // Si échec, vérifier si une bénédiction permet la relance
      if (!result.success) {
        const available = getAvailableReroll(selectedChar, testSkill);
        if (available) {
          setTestRerollAvailable(available);
        }
      }
    }, 800);
  };

  /** Relance un test de compétence raté (consomme la bénédiction) */
  const handleTestReroll = async () => {
    if (!selectedChar || !testRerollAvailable) return;

    // Consommer la bénédiction
    await consumeBlessing(testRerollAvailable);
    setTestRerollAvailable(null);
    setTestRerollUsed(true);
    setTestRolling(true);

    setTimeout(() => {
      const skillValue = selectedChar[testSkill] || 0;
      const equipBonus = getEquipmentBonus(selectedChar, testSkill);
      const result = skillTest(skillValue, testDifficulty, testBonus + equipBonus);
      setTestResult(result);
      setTestRolling(false);

      // Après la relance, vérifier s'il reste une autre bénédiction (ex: Chance après une bénédiction spécifique)
      if (!result.success) {
        // Le personnage a déjà consommé une bénédiction, vérifier s'il en reste une autre
        const updatedChar = { ...selectedChar, blessings: selectedChar.blessings.filter((b: string) => b !== testRerollAvailable) };
        const another = getAvailableReroll(updatedChar, testSkill);
        if (another) {
          setTestRerollAvailable(another);
        }
      }
    }, 800);
  };

  // Calcul des bonus pour affichage
  const combatBonusDisplay = selectedChar ? getEquipmentBonus(selectedChar, 'combat') : 0;
  const defenceBonusDisplay = selectedChar ? getEquipmentBonus(selectedChar, 'defence') : 0;
  const defFaithBonus = selectedChar ? getBlessingDefenceBonus(selectedChar) : 0;
  const totalCombat = selectedChar ? selectedChar.combat + combatBonusDisplay : 0;
  const totalDefence = selectedChar ? selectedChar.defence + defenceBonusDisplay + defFaithBonus : 0;

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
                  COM: {totalCombat}{combatBonusDisplay > 0 && <span className="text-green-400"> ({selectedChar.combat}+{combatBonusDisplay})</span>}
                  {' | '}DEF: {totalDefence}{(defenceBonusDisplay > 0 || defFaithBonus > 0) && <span className="text-green-400"> ({selectedChar.defence}+{defenceBonusDisplay + defFaithBonus})</span>}
                  {' | '}END: {selectedChar.stamina}/{selectedChar.max_stamina}
                </p>
                {selectedChar.blessings.length > 0 && (
                  <p className="text-xs text-purple-400">
                    Benedictions : {selectedChar.blessings.join(', ')}
                  </p>
                )}
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
              Test de competence
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
                      <label className="block text-sm text-parchment-200 mb-1 font-semibold">Defense</label>
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

                    {/* Bonus recap */}
                    {(combatBonusDisplay > 0 || defenceBonusDisplay > 0 || defFaithBonus > 0) && (
                      <div className="text-center text-xs text-parchment-400 mb-2">
                        Bonus actifs :
                        {combatBonusDisplay > 0 && (
                          <span className="text-green-400 ml-1">+{combatBonusDisplay} Combat</span>
                        )}
                        {(defenceBonusDisplay > 0 || defFaithBonus > 0) && (
                          <span className="text-blue-400 ml-1">+{defenceBonusDisplay + defFaithBonus} Defense</span>
                        )}
                        {defFaithBonus > 0 && (
                          <span className="text-purple-400 ml-1">(Defense par la foi)</span>
                        )}
                      </div>
                    )}

                    {/* Dice Display */}
                    <div className="flex justify-center gap-6 my-6">
                      <DiceAnimation rolling={rolling} value={lastDice?.[0] ?? 0} />
                      <DiceAnimation rolling={rolling} value={lastDice?.[1] ?? 0} />
                    </div>

                    {/* Action Buttons */}
                    {combatState.finished ? (
                      <div className="text-center space-y-3">
                        <p className={`font-medieval text-2xl ${
                          combatState.winner === 'player' ? 'text-green-400' :
                          combatState.winner === 'fled' ? 'text-yellow-400' :
                          'text-fantasy-red'
                        }`}>
                          {combatState.winner === 'player' && 'Victoire !'}
                          {combatState.winner === 'enemy' && 'Defaite...'}
                          {combatState.winner === 'fled' && 'Fuite !'}
                        </p>
                        {combatState.winner === 'fled' && (
                          <p className="text-sm text-parchment-300">
                            Vous avez fui le combat. L'ennemi a porte une derniere attaque.
                          </p>
                        )}
                        <button onClick={resetCombat} className="fantasy-button">Nouveau combat</button>
                      </div>
                    ) : canUseReroll ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-purple-900/30 border border-purple-600 rounded-lg text-center">
                          <p className="text-purple-300 font-medieval text-sm mb-1">
                            Utiliser la benediction "{rerollBlessing}" ?
                          </p>
                          <p className="text-xs text-parchment-400 mb-2">
                            La benediction sera consommee (usage unique).
                          </p>
                          <div className="flex gap-2">
                            <button onClick={handleReroll} disabled={rolling} className="flex-1 px-4 py-2 rounded font-medieval text-sm bg-purple-800 text-purple-100 border border-purple-500 hover:bg-purple-700 transition-all">
                              Relancer les des
                            </button>
                            <button onClick={acceptRound} disabled={rolling} className="flex-1 fantasy-button text-center text-sm">
                              Garder ce resultat
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button onClick={nextRound} disabled={rolling} className="fantasy-button w-full text-center text-lg">
                          {rolling ? 'Lancer des des...' : 'Lancer le round !'}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={handleFlee} disabled={rolling} className="flex-1 px-4 py-2 rounded font-medieval text-sm bg-yellow-800/50 text-yellow-300 border border-yellow-600 hover:bg-yellow-700/50 transition-all text-center">
                            Fuite
                          </button>
                          <button onClick={handleCancel} disabled={rolling} className="flex-1 fantasy-button-danger text-center text-sm">
                            Annuler le combat
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Combat Log */}
                  {combatState.rounds.length > 0 && (
                    <div className="parchment-card">
                      <h3 className="section-title">Historique des rounds</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {[...combatState.rounds].reverse().map(round => (
                          <div key={round.round} className={`p-3 bg-parchment-800/50 rounded border text-sm ${round.isFlee ? 'border-yellow-600' : 'border-parchment-600'}`}>
                            <p className="font-semibold text-parchment-100">
                              Round {round.round}
                              {round.isFlee && <span className="text-yellow-400 ml-2">(Fuite)</span>}
                            </p>
                            {round.isFlee ? (
                              <p className="text-parchment-200">
                                {selectedChar.name} fuit ! {enemyName} attaque : [{round.enemyRoll.join(', ')}] + {enemyCombat} = {round.enemyTotal} &rarr; {round.enemyDamage} degats
                              </p>
                            ) : (
                              <>
                                <p className="text-parchment-200">
                                  {selectedChar.name}: [{round.playerRoll.join(', ')}] + {totalCombat} = {round.playerTotal} &rarr; {round.playerDamage} degats
                                </p>
                                <p className="text-parchment-200">
                                  {enemyName}: [{round.enemyRoll.join(', ')}] + {enemyCombat} = {round.enemyTotal} &rarr; {round.enemyDamage} degats
                                </p>
                              </>
                            )}
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
              <h3 className="section-title">Test de competence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-parchment-200 mb-1 font-semibold">Competence</label>
                  <select value={testSkill} onChange={e => setTestSkill(e.target.value)} className="fantasy-input">
                    {Object.entries(statLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label} ({selectedChar[key]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-parchment-200 mb-1 font-semibold">Difficulte</label>
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
                      {testResult.success ? 'Reussite !' : 'Echec !'}
                    </p>
                    <p className="text-parchment-200">
                      [{testResult.dice.join(', ')}] ({testResult.diceTotal}) + {testResult.skillValue}
                      {testResult.bonus > 0 && ` + ${testResult.bonus}`} = <span className="font-bold">{testResult.total}</span>
                      {' '}vs difficulte {testResult.difficulty}
                    </p>
                    {testRerollUsed && (
                      <p className="text-xs text-purple-400 mt-1">
                        (apres relance par benediction)
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Proposition de relance par bénédiction */}
              {testRerollAvailable && testResult && !testResult.success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-purple-900/30 border border-purple-600 rounded-lg text-center"
                >
                  <p className="text-purple-300 font-medieval text-sm mb-1">
                    Utiliser la benediction "{testRerollAvailable}" pour relancer ?
                  </p>
                  <p className="text-xs text-parchment-400 mb-2">
                    La benediction sera consommee (usage unique).
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTestReroll}
                      disabled={testRolling}
                      className="flex-1 px-4 py-2 rounded font-medieval text-sm bg-purple-800 text-purple-100 border border-purple-500 hover:bg-purple-700 transition-all"
                    >
                      Relancer ({statLabels[testSkill]})
                    </button>
                    <button
                      onClick={() => setTestRerollAvailable(null)}
                      disabled={testRolling}
                      className="flex-1 fantasy-button text-center text-sm"
                    >
                      Garder le resultat
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
      {/* Modal de mort */}
      <AnimatePresence>
        {showDeathModal && selectedChar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-parchment-900 border-2 border-fantasy-red rounded-lg p-6 max-w-md w-full text-center space-y-4"
            >
              <div className="text-6xl">&#x1F480;</div>
              <h3 className="font-medieval text-2xl text-fantasy-red">{selectedChar.name} est mort(e) !</h3>
              <p className="text-parchment-300">
                L'endurance de votre personnage est tombee a 0.
              </p>

              {selectedChar.resurrection_arrangement ? (
                <div className="space-y-3">
                  <div className="bg-green-900/30 border border-green-600 rounded-lg p-3">
                    <p className="text-green-400 font-semibold">Arrangement de resurrection actif</p>
                    <p className="text-parchment-300 text-sm mt-1">{selectedChar.resurrection_arrangement}</p>
                  </div>
                  <p className="text-parchment-400 text-sm">
                    Selon les regles officielles, la resurrection entraine :
                  </p>
                  <ul className="text-parchment-300 text-sm text-left list-disc pl-5 space-y-1">
                    <li>Perte de <strong className="text-fantasy-red">tout votre argent</strong> ({selectedChar.money} chardes)</li>
                    <li>Perte de <strong className="text-fantasy-red">tout votre equipement</strong> ({selectedChar.equipment?.length || 0} objets)</li>
                    <li>Endurance restauree a <strong className="text-green-400">{selectedChar.max_stamina}</strong></li>
                    <li>L'arrangement de resurrection est <strong className="text-yellow-400">consomme</strong></li>
                  </ul>
                  <div className="flex gap-2">
                    <button onClick={handleResurrection} className="flex-1 px-4 py-2 rounded font-medieval bg-green-800 text-green-100 border border-green-600 hover:bg-green-700 transition-all">
                      Ressusciter
                    </button>
                    <button onClick={handlePermanentDeath} className="flex-1 fantasy-button-danger text-center">
                      Refuser (mort definitive)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
                    <p className="text-fantasy-red font-semibold">Aucun arrangement de resurrection</p>
                    <p className="text-parchment-400 text-sm mt-1">
                      Votre personnage n'a pas conclu d'arrangement dans un temple.
                      Vous pouvez en obtenir un en visitant un temple avant votre prochain combat.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDeathModal(false);
                        setCombatState(null);
                        setLastDice(null);
                      }}
                      className="flex-1 px-4 py-2 rounded font-medieval bg-parchment-700 text-parchment-200 border border-parchment-500 hover:bg-parchment-600 transition-all text-sm"
                    >
                      Continuer (ignorer la mort)
                    </button>
                    <button onClick={handlePermanentDeath} className="flex-1 fantasy-button-danger text-center text-sm">
                      Mort definitive
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
