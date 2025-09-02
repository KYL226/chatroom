'use client';

import { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import ChatArea from './ChatArea';
import RightSidebar from './RightSidebar';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

interface ChatLayoutProps {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export default function ChatLayout({ user }: ChatLayoutProps) {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Utiliser le hook pour maintenir le statut en ligne
  useOnlineStatus();

  useEffect(() => {
    console.log('ChatLayout render - activeRoom:', activeRoom, 'activeConversation:', activeConversation);
  });

  // Correction : un seul contexte actif à la fois
  const handleRoomSelect = (roomId: string) => {
    console.log("Sélection salle:", roomId);
    setActiveRoom(roomId);
    setActiveConversation(null);
  };
  const handleConversationSelect = (conversationId: string) => {
    console.log("Sélection conversation:", conversationId);
    setActiveConversation(conversationId);
    setActiveRoom(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar gauche */}
      <div className="flex flex-col bg-white border-r border-gray-200 w-80 overflow-y-auto">
        <LeftSidebar 
          user={user}
          activeRoom={activeRoom}
          activeConversation={activeConversation}
          onRoomSelect={handleRoomSelect}
          onConversationSelect={handleConversationSelect}
        />
      </div>

      {/* Zone centrale - Chat */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatArea 
          user={user}
          activeRoom={activeRoom}
          activeConversation={activeConversation}
        />
      </div>

      {/* Sidebar droite */}
      <div className="bg-white border-l border-gray-200 w-80 overflow-y-auto">
        <RightSidebar 
          activeRoom={activeRoom}
          activeConversation={activeConversation}
        />
      </div>
    </div>
  );
} 