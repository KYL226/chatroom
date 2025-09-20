'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '@/components/chatroom/ChatLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function ChatroomPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log("Token récupéré de localStorage:", token ? "PRÉSENT" : "ABSENT");
    
    if (!token) {
      console.log("Aucun token trouvé, redirection vers /login");
      router.push('/login');
      return;
    }

    try {
      console.log("Vérification de l'authentification avec l'API...");
      const response = await fetch('/api/users/infos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Réponse de l'API /api/users/infos:", { 
        status: response.status, 
        statusText: response.statusText 
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("Données utilisateur reçues:", userData);
        setUser(userData.user);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erreur API /api/users/infos:", errorData);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
        </div>
        <div className="px-6 py-12 mx-auto text-center border shadow-2xl rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          <p className="text-white/70">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
      <ChatLayout user={user} />
    </div>
  );
}
