import { useEffect, useCallback } from 'react';

export const useOnlineStatus = () => {
  const updateOnlineStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/users/heartbeat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut en ligne:', error);
    }
  }, []);

  useEffect(() => {
    // Mettre à jour le statut en ligne immédiatement
    updateOnlineStatus();

    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(updateOnlineStatus, 30000);

    // Mettre à jour quand la page devient visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateOnlineStatus();
      }
    };

    // Mettre à jour quand la fenêtre reprend le focus
    const handleFocus = () => {
      updateOnlineStatus();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateOnlineStatus]);

  return { updateOnlineStatus };
};
