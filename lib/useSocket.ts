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
  const triedLocalhostFallbackRef = useRef(false);
  const triedAlternatePortRef = useRef(false);

  const connect = useCallback((token: string) => {
    if (socketState?.connected || connectingRef.current) return;
    connectingRef.current = true;

    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const socket = io(baseUrl, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
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
      // Fallback localhost -> 127.0.0.1 si nécessaire
      try {
        const url = new URL(baseUrl);
        if (!triedLocalhostFallbackRef.current && url.hostname === 'localhost') {
          triedLocalhostFallbackRef.current = true;
          const alt = baseUrl.replace('localhost', '127.0.0.1');
          const altSocket = io(alt, {
            auth: { token },
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 10000
          });
          setSocketState(altSocket);
        }
      } catch {}
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('connect_timeout', () => {
      try {
        const url = new URL(baseUrl);
        if (!triedAlternatePortRef.current && (url.port === '3000' || (!url.port && url.hostname === 'localhost'))) {
          triedAlternatePortRef.current = true;
          const alt = `${url.protocol}//${url.hostname}:3001`;
          const altSocket = io(alt, {
            auth: { token },
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 10000
          });
          setSocketState(altSocket);
        }
      } catch {}
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
