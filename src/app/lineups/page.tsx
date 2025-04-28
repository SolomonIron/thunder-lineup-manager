"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEye, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

export default function LineupsPage() {
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  
  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // Fetch lineups when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      fetchLineups();
    }
  }, [selectedTeam]);
  
  // Function to fetch teams from API
  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      
      // Set the first team as default if available
      if (response.data.length > 0) {
        setSelectedTeam(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
    }
  };
  
  // Function to fetch lineups from API
  const fetchLineups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/lineups?teamId=${selectedTeam}`);
      setLineups(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching lineups:', err);
      setError('Failed to load lineups. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-thunder-dark">Lineups</h1>
          {teams.length > 0 && (
            <div className="mt-2">
              <select
                className="border border-gray-300 rounded-lg p-1"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <Link
          href="/lineups/create"
          className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
        >
          <FaPlus className="mr-2" />
          Create Lineup
        </Link>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lineups...</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}
      
      {/* No lineups message */}
      {!loading && lineups.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaCalendarAlt className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-600">
            No lineups found for this team. Create your first lineup to get started!
          </p>
        </div>
      )}
      
      {/* Lineups list */}
      {!loading && lineups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lineups.map((lineup) => (
            <div key={lineup.gameId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-thunder-dark">vs {lineup.opponent}</h2>
                <p className="text-gray-600">
                  {new Date(lineup.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">{lineup.location}</p>
              </div>
              <div className="border-t border-gray-200 p-4">
                <Link
                  href={`/lineups/${lineup.gameId}`}
                  className="w-full bg-thunder-secondary text-thunder-dark py-2 px-4 rounded-lg flex items-center justify-center hover:bg-thunder-secondary/90"
                >
                  <FaEye className="mr-2" />
                  View Lineup
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}