'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle, XCircle, AlertTriangle, Clock, User, MessageSquare, Flag } from 'lucide-react';

interface Report {
  _id: string;
  reporter: {
    _id: string;
    username: string;
    email: string;
  };
  reportedUser?: {
    _id: string;
    username: string;
    email: string;
  };
  reportedMessage?: {
    _id: string;
    content: string;
    room: string;
  };
  reportedRoom?: {
    _id: string;
    name: string;
  };
  type: 'user' | 'message' | 'room';
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    username: string;
  };
  resolution?: string;
  evidence?: string[];
}

export default function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'user' | 'message' | 'room'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');

  const filterReports = useCallback(() => {
    let filtered = reports;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.reporter.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.reportedUser?.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.reportedMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.reportedRoom?.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, typeFilter, priorityFilter]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [filterReports]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/report', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        console.error('Erreur lors du chargement des signalements');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async () => {
    if (!selectedReport) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/report/${selectedReport._id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'resolved',
          resolution
        })
      });

      if (response.ok) {
        await fetchReports(); // Recharger la liste
        setShowResolveModal(false);
        setSelectedReport(null);
        setResolution('');
      } else {
        console.error('Erreur lors de la résolution');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/report/${reportId}/dismiss`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'dismissed',
          resolution: 'Signalement rejeté'
        })
      });

      if (response.ok) {
        await fetchReports(); // Recharger la liste
      } else {
        console.error('Erreur lors du rejet');
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return badges[priority as keyof typeof badges] || badges.low;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'room':
        return <Flag className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
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
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Gestion des Signalements</h1>
        <p className="text-gray-600">Traitez les signalements des utilisateurs et modérez le contenu</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critiques</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.priority === 'critical').length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Résolus</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Flag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Rechercher un signalement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'resolved' | 'dismissed')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="resolved">Résolus</option>
            <option value="dismissed">Rejetés</option>
          </select>

          {/* Filtre par type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'user' | 'message' | 'room')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="user">Utilisateur</option>
            <option value="message">Message</option>
            <option value="room">Salle</option>
          </select>

          {/* Filtre par priorité */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="critical">Critique</option>
          </select>

          {/* Statistiques */}
          <div className="text-sm text-gray-600">
            {filteredReports.length} signalement(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Liste des signalements */}
      <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Signalement
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Priorité
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                          {getTypeIcon(report.type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Signalé par {report.reporter.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.reason}
                        </div>
                        {report.reportedUser && (
                          <div className="text-xs text-gray-400">
                            Utilisateur: {report.reportedUser.username}
                          </div>
                        )}
                        {report.reportedMessage && (
                          <div className="text-xs text-gray-400">
                            Message: {report.reportedMessage.content.substring(0, 50)}...
                          </div>
                        )}
                        {report.reportedRoom && (
                          <div className="text-xs text-gray-400">
                            Salle: {report.reportedRoom.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {report.type === 'user' ? 'Utilisateur' : 
                       report.type === 'message' ? 'Message' : 'Salle'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(report.priority)}`}>
                      {report.priority === 'low' ? 'Faible' :
                       report.priority === 'medium' ? 'Moyenne' :
                       report.priority === 'high' ? 'Élevée' : 'Critique'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(report.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(report.status)}`}>
                        {report.status === 'pending' ? 'En attente' :
                         report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowResolveModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Résoudre"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDismissReport(report._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Rejeter"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails du signalement */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold">Détails du Signalement</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Signalé par</label>
                  <p className="text-sm text-gray-900">{selectedReport.reporter.username}</p>
                  <p className="text-xs text-gray-500">{selectedReport.reporter.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900">
                  {selectedReport.type === 'user' ? 'Utilisateur' : 
                   selectedReport.type === 'message' ? 'Message' : 'Salle'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Raison</label>
                <p className="text-sm text-gray-900">{selectedReport.reason}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedReport.description}</p>
              </div>
              
              {selectedReport.reportedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Utilisateur signalé</label>
                  <p className="text-sm text-gray-900">{selectedReport.reportedUser.username}</p>
                  <p className="text-xs text-gray-500">{selectedReport.reportedUser.email}</p>
                </div>
              )}
              
              {selectedReport.reportedMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message signalé</label>
                  <div className="p-3 mt-1 text-sm bg-gray-100 rounded">
                    {selectedReport.reportedMessage.content}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Salle: {selectedReport.reportedMessage.room}</p>
                </div>
              )}
              
              {selectedReport.reportedRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salle signalée</label>
                  <p className="text-sm text-gray-900">{selectedReport.reportedRoom.name}</p>
                </div>
              )}
              
              {selectedReport.resolution && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Résolution</label>
                  <p className="text-sm text-gray-900">{selectedReport.resolution}</p>
                  {selectedReport.resolvedBy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Résolu par {selectedReport.resolvedBy.username} le {selectedReport.resolvedAt && formatDate(selectedReport.resolvedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de résolution */}
      {showResolveModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <h3 className="mb-4 text-lg font-semibold">Résoudre le Signalement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Action de résolution</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Décrivez l&apos;action prise pour résoudre ce signalement..."
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleResolveReport}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Résoudre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

