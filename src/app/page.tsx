"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaBaseballBall, 
  FaUserFriends, 
  FaCalendarAlt, 
  FaPlusCircle,
  FaChartLine,
  FaClipboardList
} from 'react-icons/fa';
import { GiBaseballGlove } from 'react-icons/gi';
import axios from 'axios';

export default function Dashboard() {
  const router = useRouter();
  const [activeTeam, setActiveTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [gameCount, setGameCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch team data
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teams');
      
      if (response.data.length > 0) {
        setTeams(response.data);
        setActiveTeam(response.data[0]);
        fetchTeamData(response.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams. Please try again.');
      setLoading(false);
    }
  };

  // Fetch team-specific data
  const fetchTeamData = async (teamId: string) => {
    try {
      // Fetch players count
      const playersResponse = await axios.get(`/api/players?teamId=${teamId}`);
      setPlayerCount(playersResponse.data.length);

      // Fetch games
      const gamesResponse = await axios.get(`/api/games?teamId=${teamId}`);
      const games = gamesResponse.data;
      setGameCount(games.length);

      // Filter for upcoming and recent games
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = games
        .filter((game: any) => new Date(game.gameDate) >= today)
        .sort((a: any, b: any) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())
        .slice(0, 3);

      const recent = games
        .filter((game: any) => new Date(game.gameDate) < today)
        .sort((a: any, b: any) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
        .slice(0, 3);

      setUpcomingGames(upcoming);
      setRecentGames(recent);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError('Failed to load team data. Please try again.');
      setLoading(false);
    }
  };

  // Handle team change
  const handleTeamChange = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    setActiveTeam(team);
    fetchTeamData(teamId);
  };

  // If loading, show spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-thunder-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no teams, show message
  if (teams.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaBaseballBall className="mx-auto text-6xl text-thunder-primary mb-4" />
          <h2 className="text-2xl font-bold text-thunder-dark mb-4">Welcome to Thunder Lineup Manager</h2>
          <p className="text-gray-600 mb-6">To get started, create your first team.</p>
          <Link
            href="/teams"
            className="px-6 py-3 bg-thunder-primary text-white rounded-lg hover:bg-thunder-primary/90 inline-flex items-center"
          >
            <FaPlusCircle className="mr-2" />
            Create Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 ml-0 md:ml-20">
      {/* Team Selector */}
      {teams.length > 1 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="font-medium text-gray-700 mr-4">Select Team:</div>
              <select
                className="mt-1 sm:mt-0 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-thunder-primary"
                value={activeTeam?.id}
                onChange={(e) => handleTeamChange(e.target.value)}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

{/* Team Header */}
<div className="bg-blue-700 rounded-lg shadow-md p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{activeTeam?.name}</h1>
            <p className="text-blue-200 mt-1">{activeTeam?.season} Season</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              href={`/teams/${activeTeam?.id}/roster`}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-gray-100 flex items-center"
            >
              <FaUserFriends className="mr-2" />
              Roster
            </Link>
            <Link
              href="/games"
              className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-gray-100 flex items-center"
            >
              <FaCalendarAlt className="mr-2" />
              Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Players" 
          value={playerCount} 
          icon={<FaUserFriends className="text-3xl text-blue-700" />} 
          href={`/teams/${activeTeam?.id}/roster`} 
        />
        <StatsCard 
          title="Games" 
          value={gameCount} 
          icon={<FaCalendarAlt className="text-3xl text-blue-700" />}
          href="/games" 
        />
        <StatsCard 
          title="Lineups" 
          value={upcomingGames.filter(g => g.hasLineup).length} 
          icon={<FaClipboardList className="text-3xl text-yellow-400" />}
          href="/lineups" 
        />
        <StatsCard 
          title="Analytics" 
          value="View" 
          icon={<FaChartLine className="text-3xl text-blue-700" />}
          href="/analytics" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Games */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-700 px-6 py-4 text-white">
            <h2 className="text-xl font-semibold">Upcoming Games</h2>
          </div>
          <div className="p-4">
            {upcomingGames.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-2" />
                <p className="text-gray-500">No upcoming games scheduled</p>
                <Link
                  href="/games"
                  className="mt-4 inline-block text-blue-700 hover:text-blue-600"
                >
                  Schedule a game
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingGames.map((game) => (
                  <div key={game.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-700">
                    <div>
                      <h3 className="font-medium">vs {game.opponentName}</h3>
                      <p className="text-sm text-gray-600">{game.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{new Date(game.gameDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{new Date(game.gameDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    {game.hasLineup ? (
                      <Link
                        href={`/lineups/${game.id}`}
                        className="ml-4 p-2 rounded-lg bg-yellow-400 text-gray-800 hover:bg-yellow-300"
                        title="View Lineup"
                      >
                        <FaClipboardList />
                      </Link>
                    ) : (
                      <Link
                        href={`/lineups/create?gameId=${game.id}`}
                        className="ml-4 p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-600"
                        title="Create Lineup"
                      >
                        <FaPlusCircle />
                      </Link>
                    )}
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link
                    href="/games"
                    className="text-blue-700 hover:text-blue-600 text-sm"
                  >
                    View all games
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Games */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-700 px-6 py-4 text-white">
            <h2 className="text-xl font-semibold">Recent Games</h2>
          </div>
          <div className="p-4">
            {recentGames.length === 0 ? (
              <div className="text-center py-8">
                <GiBaseballGlove className="mx-auto text-4xl text-gray-300 mb-2" />
                <p className="text-gray-500">No recent games</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGames.map((game) => (
                  <div key={game.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">vs {game.opponentName}</h3>
                      <p className="text-sm text-gray-600">{game.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{new Date(game.gameDate).toLocaleDateString()}</p>
                      {game.hasLineup && (
                        <Link
                          href={`/lineups/${game.id}`}
                          className="text-sm text-blue-700 hover:text-blue-600"
                        >
                          View Lineup
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link
                    href="/games?filter=past"
                    className="text-blue-700 hover:text-blue-600 text-sm"
                  >
                    View past games
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href={`/teams/${activeTeam?.id}/roster`}
            className="bg-blue-700 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <FaUserFriends className="mr-2" />
            Manage Roster
          </Link>
          <Link
            href="/games"
            className="bg-yellow-400 text-gray-800 py-4 px-6 rounded-lg flex items-center justify-center hover:bg-yellow-300 transition-colors"
          >
            <FaCalendarAlt className="mr-2" />
            Schedule Game
          </Link>
          <Link
            href="/lineups/create"
            className="bg-blue-700 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <FaClipboardList className="mr-2" />
            Create Lineup
          </Link>
          <Link
            href="/analytics"
            className="bg-yellow-400 text-gray-800 py-4 px-6 rounded-lg flex items-center justify-center hover:bg-yellow-300 transition-colors"
          >
            <FaChartLine className="mr-2" />
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}


// Stats Card Component
const StatsCard = ({ title, value, icon, href }: { title: string, value: number | string, icon: React.ReactNode, href: string }) => {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
};