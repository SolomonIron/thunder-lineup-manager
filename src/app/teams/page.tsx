"use client";

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaBaseballBall, FaUserFriends } from 'react-icons/fa';

// Mock data for teams
const mockTeams = [
  {
    id: '1',
    name: '2025 Ohio Thunder',
    season: '2025',
    coachPitch: true,
    playerCount: 12,
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: '2026 Ohio Thunder',
    season: '2026',
    coachPitch: false,
    playerCount: 0,
    createdAt: '2025-12-01',
  },
];

export default function TeamsPage() {
  const [teams, setTeams] = useState(mockTeams);
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);

  const deleteTeam = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      setTeams(teams.filter(team => team.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-thunder-dark">Teams</h1>
        <button
          onClick={() => setShowNewTeamModal(true)}
          className="w-full sm:w-auto bg-thunder-primary text-white flex items-center justify-center px-4 py-2 rounded-lg hover:bg-thunder-primary/90 transition-colors"
        >
          <FaPlus className="mr-2" />
          New Team
        </button>
      </div>

      {/* Mobile view - cards */}
      <div className="block sm:hidden space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-thunder-dark">{team.name}</h2>
                <p className="text-sm text-gray-600">Season: {team.season}</p>
                <p className="text-sm text-gray-600">
                  {team.coachPitch ? 'Coach Pitch' : 'Kid Pitch'}
                </p>
                <div className="flex items-center mt-2">
                  <FaUserFriends className="text-thunder-primary mr-1" />
                  <span className="text-sm">{team.playerCount} Players</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Link 
                  href={`/teams/${team.id}`}
                  className="bg-thunder-primary text-white p-2 rounded-full hover:bg-thunder-primary/90"
                >
                  <FaEdit />
                </Link>
                <button 
                  onClick={() => deleteTeam(team.id)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link 
                href={`/teams/${team.id}/roster`}
                className="w-full bg-thunder-secondary text-thunder-dark py-2 px-4 rounded-lg flex items-center justify-center hover:bg-thunder-secondary/90"
              >
                <FaUserFriends className="mr-2" />
                Manage Roster
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view - table */}
      <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Players
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{team.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{team.season}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      team.coachPitch ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {team.coachPitch ? 'Coach Pitch' : 'Kid Pitch'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUserFriends className="mr-1" />
                      {team.playerCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      <Link
                        href={`/teams/${team.id}/roster`}
                        className="text-thunder-secondary hover:text-thunder-secondary/80"
                        title="Manage Roster"
                      >
                        <FaUserFriends className="text-xl" />
                      </Link>
                      <Link
                        href={`/teams/${team.id}`}
                        className="text-thunder-primary hover:text-thunder-primary/80"
                        title="Edit Team"
                      >
                        <FaEdit className="text-xl" />
                      </Link>
                      <button
                        onClick={() => deleteTeam(team.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete Team"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewTeamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., 2025 Ohio Thunder"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                  placeholder="e.g., 2025"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="coachPitch"
                  className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="coachPitch" className="ml-2 block text-sm text-gray-700">
                  Coach Pitch
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewTeamModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}