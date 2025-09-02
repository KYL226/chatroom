'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ChatLayout user={user} />;
}
