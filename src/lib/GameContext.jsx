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
  'world peace',
  'free ice cream for life',
  'unlimited vacation days',
  'a personal chef',
  'winning the lottery',
  'a dog that does the dishes',
  'a Netflix show about you',
  'free Wi-Fi everywhere',
  'an extra hour of sleep',
  'finding $20 in your pocket',
  'a perfect hair day every day',
  'knowing all the answers on Jeopardy',
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
