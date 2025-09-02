'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface StatisticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalMessages: number;
    totalRooms: number;
    totalReports: number;
    pendingReports: number;
  };
  period: {
    newUsers: number;
    newMessages: number;
    newRooms: number;
    newReports: number;
  };
  activity: {
    hourly: Array<{ _id: number; count: number }>;
    topRooms: Array<{ roomName: string; messageCount: number }>;
    topUsers: Array<{ userName: string; messageCount: number }>;
  };
  reports: Array<{ _id: string; count: number }>;
}

interface AdminDashboardProps {
  className?: string;
  user?: User;
}

export default function AdminDashboard({ className = "" }: AdminDashboardProps) {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('7d');

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/statistics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Fetch statistics error:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  if (loading) {
    return (
      <div className={`${className} p-6`}>
        <div className="text-center">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-6`}>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${className} p-6`}>
        <div className="text-center">Aucune donnée disponible</div>
      </div>
    );
  }

  // Préparation des données pour les graphiques
  const hourlyData = {
    labels: data.activity.hourly.map(item => `${item._id}h`),
    datasets: [
      {
        label: 'Messages par heure',
        data: data.activity.hourly.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const topRoomsData = {
    labels: data.activity.topRooms.map(item => item.roomName),
    datasets: [
      {
        label: 'Messages',
        data: data.activity.topRooms.map(item => item.messageCount),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const reportsData = {
    labels: data.reports.map(item => item._id),
    datasets: [
      {
        data: data.reports.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className={`${className} p-6`}>
      <div className="mb-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Tableau de Bord Administratif</h2>
        
        {/* Sélecteur de période */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPeriod('1d')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '1d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '7d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '30d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            30 jours
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs Totaux</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-600">+{data.period.newUsers} nouveaux</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.activeUsers}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}% en ligne
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages Totaux</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-600">+{data.period.newMessages} nouveaux</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Signalements</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalReports}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-2 text-sm text-red-600">
            {data.overview.pendingReports} en attente
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        {/* Activité horaire */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Activité par Heure</h3>
          <Line data={hourlyData} options={chartOptions} />
        </div>

        {/* Top salles */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Salles les Plus Actives</h3>
          <Bar data={topRoomsData} options={chartOptions} />
        </div>
      </div>

      {/* Statistiques des signalements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Répartition des Signalements</h3>
          <Doughnut data={reportsData} options={chartOptions} />
        </div>

        {/* Top utilisateurs */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Utilisateurs les Plus Actifs</h3>
          <div className="space-y-3">
            {data.activity.topUsers.slice(0, 5).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-md bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-blue-500 rounded-full">
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.messageCount} messages</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 