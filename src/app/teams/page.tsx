"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaUserFriends } from 'react-icons/fa';
import axios from 'axios';
import PageHeader from '@/components/ui/PageHeader';

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    season: '',
    coachPitch: true
  });

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Function to fetch teams from API
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Function to open the edit modal
  const openEditModal = (team: any = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        season: team.season,
        coachPitch: team.coachPitch
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        season: new Date().getFullYear().toString(),
        coachPitch: true
      });
    }
    setShowNewTeamModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setEditingTeam(null);
    setShowNewTeamModal(false);
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTeam) {
        // Update existing team
        await axios.put(`/api/teams/${editingTeam.id}`, formData);
      } else {
        // Create new team
        await axios.post('/api/teams', formData);
      }
      
      // Refresh the teams list
      await fetchTeams();
      
      // Close the modal
      closeModal();
    } catch (err) {
      console.error('Error saving team:', err);
      setError('Failed to save team. Please try again.');
    }
  };

  // Function to delete a team
  const deleteTeam = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/teams/${id}`);
        
        // Refresh the teams list
        await fetchTeams();
      } catch (err) {
        console.error('Error deleting team:', err);
        setError('Failed to delete team. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Teams"
        subtitle="Manage your baseball teams"
        actionButton={{
          label: "New Team",
          onClick: () => openEditModal(),
          icon: <FaPlus />
        }}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teams...</p>
        </div>
      )}

      {/* No teams message */}
      {!loading && teams.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaUserFriends className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">
            No teams found. Create your first team to get started!
          </p>
          <button
            onClick={() => openEditModal()}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
          >
            <FaPlus className="inline mr-2" />
            Create Team
          </button>
        </div>
      )}

      {/* Teams list */}
      {!loading && teams.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      {team.playerCount || 0}
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
                        className="text-yellow-400 hover:text-yellow-500"
                        title="Manage Roster"
                      >
                        <FaUserFriends className="text-xl" />
                      </Link>
                      <button
                        onClick={() => openEditModal(team)}
                        className="text-blue-700 hover:text-blue-800"
                        title="Edit Team"
                      >
                        <FaEdit className="text-xl" />
                      </button>
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
      )}

      {/* Team Modal */}
      {showNewTeamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., 2025 Ohio Thunder"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season
                </label>
                <input
                  type="text"
                  name="season"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  placeholder="e.g., 2025"
                  value={formData.season}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="coachPitch"
                  name="coachPitch"
                  className="h-4 w-4 text-blue-700 focus:ring-blue-700 border-gray-300 rounded"
                  checked={formData.coachPitch}
                  onChange={handleInputChange}
                />
                <label htmlFor="coachPitch" className="ml-2 block text-sm text-gray-700">
                  Coach Pitch
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}