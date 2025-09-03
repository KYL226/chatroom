'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { User } from '@/types/global';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Utiliser localStorage au lieu de document.cookie
      const token = localStorage.getItem('token');
      console.log('AdminLayout - Token récupéré:', token ? 'PRÉSENT' : 'ABSENT');
      
      if (!token) {
        console.log('AdminLayout - Pas de token, redirection vers login');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/users/infos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('AdminLayout - Réponse API:', response.status, response.statusText);

      if (!response.ok) {
        console.log('AdminLayout - Réponse non OK, redirection vers login');
        window.location.href = '/login';
        return;
      }

      const userData = await response.json();
      console.log('AdminLayout - Données utilisateur:', userData);

      if (userData.user.role !== 'admin' && userData.user.role !== 'moderator') {
        console.log('AdminLayout - Utilisateur non admin/moderator, redirection vers home');
        window.location.href = '/';
        return;
      }

      console.log('AdminLayout - Authentification réussie, utilisateur:', userData.user);
      setUser(userData.user);
    } catch (error) {
      console.error('AdminLayout - Erreur auth:', error);
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar user={user} />
      
      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
