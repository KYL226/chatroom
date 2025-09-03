'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, MessageSquare, Hash, TrendingUp, Activity, BarChart3, UserPlus, AlertTriangle } from 'lucide-react';

interface Statistics {
  users: {
    total: number;
    online: number;
    newThisWeek: number;
    newThisMonth: number;
    banned: number;
    active: number;
  };
  messages: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    averagePerUser: number;
  };
  rooms: {
    total: number;
    active: number;
    popular: Array<{
      name: string;
      messageCount: number;
      userCount: number;
    }>;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
    dismissed: number;
    critical: number;
  };
  activity: {
    hourly: Array<{ hour: number; count: number }>;
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
  };
  topUsers: Array<{
    username: string;
    messageCount: number;
    lastSeen: string;
  }>;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'messages' | 'users' | 'activity'>('messages');

  const fetchStatistics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/statistics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Erreur lors du chargement des statistiques');
        // Données de démonstration en cas d'erreur
        setStats(getDemoStats());
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Données de démonstration en cas d'erreur
      setStats(getDemoStats());
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange, fetchStatistics]);

  const getDemoStats = (): Statistics => {
    return {
      users: {
        total: 1247,
        online: 89,
        newThisWeek: 23,
        newThisMonth: 156,
        banned: 12,
        active: 892
      },
      messages: {
        total: 45678,
        today: 1234,
        thisWeek: 8765,
        thisMonth: 34567,
        averagePerUser: 36.7
      },
      rooms: {
        total: 45,
        active: 38,
        popular: [
          { name: 'Général', messageCount: 12345, userCount: 234 },
          { name: 'Gaming', messageCount: 8765, userCount: 156 },
          { name: 'Musique', messageCount: 6543, userCount: 98 },
          { name: 'Tech', messageCount: 5432, userCount: 87 },
          { name: 'Sport', messageCount: 4321, userCount: 76 }
        ]
      },
      reports: {
        total: 89,
        pending: 12,
        resolved: 67,
        dismissed: 10,
        critical: 3
      },
      activity: {
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 100) + 20
        })),
        daily: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 1000) + 500
        })),
        weekly: Array.from({ length: 4 }, (_, i) => ({
          week: `Semaine ${i + 1}`,
          count: Math.floor(Math.random() * 5000) + 2000
        }))
      },
      topUsers: [
        { username: 'alice123', messageCount: 1234, lastSeen: new Date().toISOString() },
        { username: 'bob456', messageCount: 987, lastSeen: new Date().toISOString() },
        { username: 'charlie789', messageCount: 876, lastSeen: new Date().toISOString() },
        { username: 'diana012', messageCount: 765, lastSeen: new Date().toISOString() },
        { username: 'edward345', messageCount: 654, lastSeen: new Date().toISOString() }
      ]
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="w-1/4 h-8 mb-6 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Impossible de charger les statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Statistiques et Analytics</h1>
        <p className="text-gray-600">Vue d&apos;ensemble de l&apos;activité de la plateforme</p>
      </div>

      {/* Sélecteur de période */}
      <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Période:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d' | '90d')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">24 heures</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedMetric('messages')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'messages' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setSelectedMetric('users')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'users' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setSelectedMetric('activity')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'activity' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Activité
            </button>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Utilisateurs */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.users.total)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="ml-1 text-sm text-green-600">
                  +{stats.users.newThisWeek} cette semaine
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">En ligne</span>
              <span className="font-medium">{stats.users.online}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Actifs</span>
              <span className="font-medium">{stats.users.active}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.messages.total)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="ml-1 text-sm text-green-600">
                  +{formatNumber(stats.messages.today)} aujourd&apos;hui
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cette semaine</span>
              <span className="font-medium">{formatNumber(stats.messages.thisWeek)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Moyenne/utilisateur</span>
              <span className="font-medium">{stats.messages.averagePerUser}</span>
            </div>
          </div>
        </div>

        {/* Salles */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Hash className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Salles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rooms.total}</p>
              <div className="flex items-center mt-1">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className="ml-1 text-sm text-purple-600">
                  {stats.rooms.active} actives
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Actives</span>
              <span className="font-medium">{stats.rooms.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taux d&apos;activité</span>
              <span className="font-medium">
                {Math.round((stats.rooms.active / stats.rooms.total) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Signalements */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Signalements</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.reports.total}</p>
              <div className="flex items-center mt-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="ml-1 text-sm text-red-600">
                  {stats.reports.pending} en attente
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Résolus</span>
              <span className="font-medium">{stats.reports.resolved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Critiques</span>
              <span className="font-medium">{stats.reports.critical}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Graphique d'activité */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Activité {timeRange === '24h' ? 'horaires' : 'quotidienne'}</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {selectedMetric === 'messages' && stats.activity.daily.map((day, index) => (
              <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${(day.count / Math.max(...stats.activity.daily.map(d => d.count))) * 100}%` }}>
                <div className="text-xs text-center text-white transform rotate-90 translate-x-2 translate-y-8">
                  {formatNumber(day.count)}
                </div>
              </div>
            ))}
            {selectedMetric === 'users' && stats.activity.daily.map((day, index) => (
              <div key={index} className="flex-1 bg-green-500 rounded-t" style={{ height: `${(day.count / Math.max(...stats.activity.daily.map(d => d.count))) * 100}%` }}>
                <div className="text-xs text-center text-white transform rotate-90 translate-x-2 translate-y-8">
                  {formatNumber(day.count)}
                </div>
              </div>
            ))}
            {selectedMetric === 'activity' && stats.activity.daily.map((day, index) => (
              <div key={index} className="flex-1 bg-purple-500 rounded-t" style={{ height: `${(day.count / Math.max(...stats.activity.daily.map(d => d.count))) * 100}%` }}>
                <div className="text-xs text-center text-white transform rotate-90 translate-x-2 translate-y-8">
                  {formatNumber(day.count)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {stats.activity.daily.map((day, index) => (
              <span key={index}>{formatDate(day.date)}</span>
            ))}
          </div>
        </div>

        {/* Salles populaires */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Salles les plus populaires</h3>
          <div className="space-y-3">
            {stats.rooms.popular.map((room, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Hash className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{room.name}</p>
                    <p className="text-xs text-gray-500">{room.userCount} utilisateurs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(room.messageCount)}</p>
                  <p className="text-xs text-gray-500">messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilisateurs les plus actifs */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Utilisateurs les plus actifs</h3>
          <div className="space-y-3">
            {stats.topUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <UserPlus className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">Dernière activité: {formatDate(user.lastSeen)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatNumber(user.messageCount)}</p>
                  <p className="text-xs text-gray-500">messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="p-6 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistiques détaillées</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nouveaux utilisateurs ce mois</span>
              <span className="text-sm font-medium text-gray-900">{stats.users.newThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Utilisateurs bannis</span>
              <span className="text-sm font-medium text-gray-900">{stats.users.banned}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Messages ce mois</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(stats.messages.thisMonth)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Signalements résolus</span>
              <span className="text-sm font-medium text-gray-900">{stats.reports.resolved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taux de résolution</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((stats.reports.resolved / stats.reports.total) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

