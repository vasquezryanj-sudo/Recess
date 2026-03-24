'use client';
import { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export const ANIMALS = [
  { id: 'fox', emoji: '🦊', label: 'Fox', color: '#E07A2F' },
  { id: 'bear', emoji: '🐻', label: 'Bear', color: '#8B5E3C' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit', color: '#F4A7B9' },
  { id: 'frog', emoji: '🐸', label: 'Frog', color: '#2D6A4F' },
  { id: 'cat', emoji: '🐱', label: 'Cat', color: '#9B8EA8' },
  { id: 'penguin', emoji: '🐧', label: 'Penguin', color: '#1B2A4A' },
  { id: 'owl', emoji: '🦉', label: 'Owl', color: '#C8A96E' },
  { id: 'duck', emoji: '🦆', label: 'Duck', color: '#D4A843' },
  { id: 'wolf', emoji: '🐺', label: 'Wolf', color: '#7A8FA6' },
  { id: 'raccoon', emoji: '🦝', label: 'Raccoon', color: '#6B7280' },
  { id: 'lion', emoji: '🦁', label: 'Lion', color: '#D4A843' },
  { id: 'elephant', emoji: '🐘', label: 'Elephant', color: '#9CA3AF' },
];

export const ROTATING_PHRASES = [
  'finding $20 in your pocket',
  'a dog doing the dishes',
  'your therapist finally getting it',
  'taxes doing themselves',
  'a burrito that never ends',
  'your ex moving to another continent',
  'a shower with perfect water pressure forever',
  'winning an argument with your mother',
  'a hangover that makes you stronger',
  'birds deciding to shut up at 6am',
  'a dentist who says everything looks great',
  'pooping at exactly the right moment',
  'your boss accidentally replying all with their resignation',
  'a fart that smells like fresh bread',
  'dying peacefully in your sleep at 140',
  'finding out gluten was a hoax',
  'a mattress that gets better every year',
  'accidentally inventing a religion',
  'a parking spot that follows you around',
  'your enemies getting mildly inconvenienced forever',
];

export function GameProvider({ children }) {
  const [game, setGame] = useState({
    title: '',
    bggGame: null,
    players: [],
    scores: {},
    firstPlayer: null,
    startedAt: null,
  });

  const addPlayer = (name, animal) => {
    const id = `${name}-${Date.now()}`;
    setGame(g => ({
      ...g,
      players: [...g.players, { id, name, animal }],
      scores: { ...g.scores, [id]: 0 },
    }));
  };

  const removePlayer = (id) => {
    setGame(g => {
      const players = g.players.filter(p => p.id !== id);
      const scores = { ...g.scores };
      delete scores[id];
      return { ...g, players, scores };
    });
  };

  const updateScore = (playerId, delta) => {
    setGame(g => ({
      ...g,
      scores: { ...g.scores, [playerId]: (g.scores[playerId] || 0) + delta },
    }));
  };

  const setFirstPlayer = (player) => setGame(g => ({ ...g, firstPlayer: player }));

  const resetGame = () => setGame({
    title: '', bggGame: null, players: [], scores: {}, firstPlayer: null, startedAt: null,
  });

  return (
    <GameContext.Provider value={{ game, setGame, addPlayer, removePlayer, updateScore, setFirstPlayer, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
