'use client';

import { useState } from 'react';
import { X, AlertTriangle, User, MessageSquare, Hash } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'user' | 'message' | 'room';
  targetId: string;
  targetName: string;
  targetContent?: string;
}

const REPORT_REASONS = {
  user: [
    'Comportement inapproprié',
    'Spam',
    'Harcèlement',
    'Contenu offensant',
    'Fausse identité',
    'Autre'
  ],
  message: [
    'Contenu inapproprié',
    'Spam',
    'Harcèlement',
    'Informations personnelles',
    'Contenu illégal',
    'Autre'
  ],
  room: [
    'Contenu inapproprié',
    'Spam',
    'Harcèlement',
    'Nom de salle offensant',
    'Description inappropriée',
    'Autre'
  ]
};

export default function ReportModal({ 
  isOpen, 
  onClose, 
  type, 
  targetId, 
  targetName, 
  targetContent 
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour signaler');
        return;
      }

      const reportData: {
        reason: string;
        description: string;
        reportedUser?: string;
        reportedMessage?: string;
        reportedRoom?: string;
      } = {
        reason,
        description: description.trim()
      };

      // Ajouter l'élément signalé selon le type
      switch (type) {
        case 'user':
          reportData.reportedUser = targetId;
          break;
        case 'message':
          reportData.reportedMessage = targetId;
          break;
        case 'room':
          reportData.reportedRoom = targetId;
          break;
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setReason('');
          setDescription('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du signalement');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'user':
        return <User className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'room':
        return <Hash className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'user':
        return 'utilisateur';
      case 'message':
        return 'message';
      case 'room':
        return 'salle';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Signaler un {getTypeLabel()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu signalé */}
        <div className="p-3 mb-4 rounded-lg bg-gray-50">
          <div className="flex items-center mb-2 space-x-2">
            {getTypeIcon()}
            <span className="font-medium text-gray-900">{targetName}</span>
          </div>
          {targetContent && (
            <p className="text-sm text-gray-600 truncate">{targetContent}</p>
          )}
        </div>

        {success ? (
          <div className="py-4 text-center">
            <div className="mb-2 text-green-500">
              <AlertTriangle className="w-8 h-8 mx-auto" />
            </div>
            <p className="font-medium text-green-700">
              Signalement envoyé avec succès !
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Raison */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Raison du signalement *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Sélectionner une raison</option>
                {REPORT_REASONS[type].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description détaillée *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Décrivez en détail pourquoi vous signalez cet élément..."
                required
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                {error}
              </div>
            )}

            {/* Boutons */}
            <div className="flex pt-4 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white transition-colors bg-red-600 border border-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : 'Signaler'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}