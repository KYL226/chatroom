import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
}

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const connectingRef = useRef(false);

  const connect = useCallback((token: string) => {
    if (socketState?.connected || connectingRef.current) return;
    
    if (!token) {
      console.error('❌ No token provided for Socket.IO connection');
      return;
    }
    
    console.log('🔌 Attempting to connect to Socket.IO with token:', token.substring(0, 20) + '...');
    connectingRef.current = true;

    // Configuration pour production et développement
    // Use the same port as Next.js (3000) for development
    const computedDefault = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
      : 'http://localhost:3000';
    
    // En production, utiliser l'URL du serveur Render
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
        ? 'https://chatroom-mav1.onrender.com' 
        : computedDefault);

    const socket = io(baseUrl, {
      auth: { token },
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('Socket connecté:', socket.id);
      setIsConnected(true);
      connectingRef.current = false;
    });

    socket.on('disconnect', () => {
      console.log('Socket déconnecté');
      setIsConnected(false);
      connectingRef.current = false;
    });

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket:', error);
      setIsConnected(false);
      connectingRef.current = false;
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocketState(socket);
  }, [socketState]);

  const disconnect = useCallback(() => {
    if (socketState) {
      socketState.disconnect();
      setSocketState(null);
      setIsConnected(false);
    }
  }, [socketState]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketState,
    isConnected,
    connect,
    disconnect
  };
}
