'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  isOnline: boolean;
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: string;
  createdAt: string;
  lastSeen?: string;
  avatar?: string;
  bio?: string;
  age?: number;
  gender?: string;
  interests?: string[];
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'moderator'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('7'); // days

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'online':
          filtered = filtered.filter(user => user.isOnline);
          break;
        case 'offline':
          filtered = filtered.filter(user => !user.isOnline && !user.isBanned);
          break;
        case 'banned':
          filtered = filtered.filter(user => user.isBanned);
          break;
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter, filterUsers]);

  const handleBanUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${selectedUser._id}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: banReason,
          duration: parseInt(banDuration)
        })
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
        setShowBanModal(false);
        setSelectedUser(null);
        setBanReason('');
        setBanDuration('7');
      } else {
        console.error('Erreur lors du bannissement');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/unban`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
      } else {
        console.error('Erreur lors du débannissement');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
      } else {
        console.error('Erreur lors du changement de rôle');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers(); // Recharger la liste
      } else {
        console.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-orange-100 text-orange-800',
      user: 'bg-blue-100 text-blue-800'
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  const getStatusBadge = (user: User) => {
    if (user.isBanned) return 'bg-red-100 text-red-800';
    if (user.isOnline) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="w-1/4 h-8 mb-6 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-gray-600">Gérez les utilisateurs, leurs rôles et leurs statuts</p>
      </div>

      {/* Filtres et recherche */}
      <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'moderator' | 'admin')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="user">Utilisateurs</option>
            <option value="moderator">Modérateurs</option>
            <option value="admin">Administrateurs</option>
          </select>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'online' | 'offline' | 'banned')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="offline">Hors ligne</option>
            <option value="banned">Bannis</option>
          </select>

          {/* Statistiques */}
          <div className="text-sm text-gray-600">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Rôle
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date d&apos;inscription
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-10 h-10 rounded-full"
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                          alt={user.username}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'moderator' ? 'Modérateur' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user)}`}>
                      {user.isBanned ? 'Banni' : user.isOnline ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {user.lastSeen ? formatDate(user.lastSeen) : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUnbanUser(user._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Débannir"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Bannir"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails utilisateur */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold">Détails de l&apos;utilisateur</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom d&apos;utilisateur</label>
                <p className="text-sm text-gray-900">{selectedUser.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleChangeRole(selectedUser._id, e.target.value as 'user' | 'moderator' | 'admin')}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user">Utilisateur</option>
                  <option value="moderator">Modérateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              {selectedUser.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <p className="text-sm text-gray-900">{selectedUser.bio}</p>
                </div>
              )}
              
              {selectedUser.age && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Âge</label>
                  <p className="text-sm text-gray-900">{selectedUser.age} ans</p>
                </div>
              )}
              
              {selectedUser.interests && selectedUser.interests.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Intérêts</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.interests.map((interest, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de bannissement */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold">Bannir {selectedUser.username}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Raison du bannissement</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Expliquez la raison du bannissement..."
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Durée (en jours)</label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">1 jour</option>
                  <option value="7">7 jours</option>
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleBanUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Bannir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

