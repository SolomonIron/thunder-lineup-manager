"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

// Mock team data
const mockTeams = [
  {
    id: '1',
    name: '2025 Ohio Thunder',
    season: '2025',
    coachPitch: true,
  },
  {
    id: '2',
    name: '2026 Ohio Thunder',
    season: '2026',
    coachPitch: false,
  },
];

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch team data
  useEffect(() => {
    // In a real application, we'd fetch from an API
    const foundTeam = mockTeams.find(t => t.id === teamId);
    setTeam(foundTeam || {});
    setLoading(false);
  }, [teamId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, we'd save to an API
    alert('Team updated successfully!');
    router.push('/teams');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <p>Loading...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <p>Team not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/teams')}
          className="mr-4 text-thunder-primary hover:text-thunder-primary/80"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-thunder-dark">Edit Team</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
              defaultValue={team.name}
              required
            />
          </div>

          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
              Season
            </label>
            <input
              id="season"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
              defaultValue={team.season}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="coachPitch"
              type="checkbox"
              className="h-4 w-4 text-thunder-primary focus:ring-thunder-primary border-gray-300 rounded"
              defaultChecked={team.coachPitch}
            />
            <label htmlFor="coachPitch" className="ml-2 block text-sm text-gray-700">
              Coach Pitch
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 flex items-center"
            >
              <FaSave className="mr-2" />
              Save Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}