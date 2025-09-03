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
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
        </div>
        <div className="px-6 py-10 mx-auto text-center border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-500"></div>
          <p className="text-white/70">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
      </div>
      {/* Sidebar */}
      <AdminSidebar user={user} />
      
      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="min-h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        {children}
        </div>
      </div>
    </div>
  );
}
