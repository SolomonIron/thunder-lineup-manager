// src/context/DatabaseContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface TeamData {
  id: string;
  name: string;
  season: string;
  coachPitch: boolean;
  playerCount?: number;
  gameCount?: number;
}

interface PlayerData {
  id: string;
  name: string;
  jerseyNumber?: string;
  skillLevel: number;
  active: boolean;
  positionPreferences?: any[];
}

interface GameData {
  id: string;
  opponentName: string;
  gameDate: Date;
  location?: string;
  opponentDifficulty: number;
  outfielderCount: number;
  playerCount: number;
  notes?: string;
  hasLineup?: boolean;
}

interface DatabaseContextType {
  // Team functions
  fetchTeams: () => Promise<TeamData[]>;
  fetchTeam: (id: string) => Promise<TeamData>;
  createTeam: (data: Partial<TeamData>) => Promise<TeamData>;
  updateTeam: (id: string, data: Partial<TeamData>) => Promise<TeamData>;
  deleteTeam: (id: string) => Promise<void>;
  
  // Player functions
  fetchPlayers: (teamId: string) => Promise<PlayerData[]>;
  fetchPlayer: (id: string) => Promise<PlayerData>;
  createPlayer: (data: Partial<PlayerData> & { teamId: string }) => Promise<PlayerData>;
  updatePlayer: (id: string, data: Partial<PlayerData>) => Promise<PlayerData>;
  deletePlayer: (id: string) => Promise<void>;
  
  // Game functions
  fetchGames: (teamId: string) => Promise<GameData[]>;
  fetchGame: (id: string) => Promise<GameData>;
  createGame: (data: Partial<GameData> & { teamId: string }) => Promise<GameData>;
  updateGame: (id: string, data: Partial<GameData>) => Promise<GameData>;
  deleteGame: (id: string) => Promise<void>;
  
  // Lineup functions
  createLineup: (data: any) => Promise<any>;
  fetchLineup: (gameId: string) => Promise<any>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // Team functions
  const fetchTeams = async () => {
    const response = await axios.get('/api/teams');
    return response.data;
  };
  
  const fetchTeam = async (id: string) => {
    const response = await axios.get(`/api/teams/${id}`);
    return response.data;
  };
  
  const createTeam = async (data: Partial<TeamData>) => {
    const response = await axios.post('/api/teams', data);
    return response.data;
  };
  
  const updateTeam = async (id: string, data: Partial<TeamData>) => {
    const response = await axios.put(`/api/teams/${id}`, data);
    return response.data;
  };
  
  const deleteTeam = async (id: string) => {
    await axios.delete(`/api/teams/${id}`);
    router.refresh();
  };
  
  // Player functions
  const fetchPlayers = async (teamId: string) => {
    const response = await axios.get(`/api/players?teamId=${teamId}`);
    return response.data;
  };
  
  const fetchPlayer = async (id: string) => {
    const response = await axios.get(`/api/players/${id}`);
    return response.data;
  };
  
  const createPlayer = async (data: Partial<PlayerData> & { teamId: string }) => {
    const response = await axios.post('/api/players', data);
    return response.data;
  };
  
  const updatePlayer = async (id: string, data: Partial<PlayerData>) => {
    const response = await axios.put(`/api/players/${id}`, data);
    return response.data;
  };
  
  const deletePlayer = async (id: string) => {
    await axios.delete(`/api/players/${id}`);
    router.refresh();
  };
  
  // Game functions
  const fetchGames = async (teamId: string) => {
    const response = await axios.get(`/api/games?teamId=${teamId}`);
    return response.data;
  };
  
  const fetchGame = async (id: string) => {
    const response = await axios.get(`/api/games/${id}`);
    return response.data;
  };
  
  const createGame = async (data: Partial<GameData> & { teamId: string }) => {
    const response = await axios.post('/api/games', data);
    return response.data;
  };
  
  const updateGame = async (id: string, data: Partial<GameData>) => {
    const response = await axios.put(`/api/games/${id}`, data);
    return response.data;
  };
  
  const deleteGame = async (id: string) => {
    await axios.delete(`/api/games/${id}`);
    router.refresh();
  };
  
  // Lineup functions
  const createLineup = async (data: any) => {
    const response = await axios.post('/api/lineups', data);
    return response.data;
  };
  
  const fetchLineup = async (gameId: string) => {
    const response = await axios.get(`/api/lineups/${gameId}`);
    return response.data;
  };
  
  const value = {
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    
    fetchPlayers,
    fetchPlayer,
    createPlayer,
    updatePlayer,
    deletePlayer,
    
    fetchGames,
    fetchGame,
    createGame,
    updateGame,
    deleteGame,
    
    createLineup,
    fetchLineup,
  };
  
  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}