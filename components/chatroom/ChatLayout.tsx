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
    <div className="flex h-full w-full">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
      </div>
      {/* Sidebar gauche */}
      <div className="flex flex-col w-80 h-full border-r border-white/10 bg-white/5 backdrop-blur-sm">
        <LeftSidebar 
          user={user}
          activeRoom={activeRoom}
          activeConversation={activeConversation}
          onRoomSelect={handleRoomSelect}
          onConversationSelect={handleConversationSelect}
        />
      </div>

      {/* Zone centrale - Chat */}
      <div className="flex flex-col flex-1 h-full">
        <ChatArea 
          user={user}
          activeRoom={activeRoom}
          activeConversation={activeConversation}
        />
      </div>

      {/* Sidebar droite */}
      <div className="w-80 h-full border-l border-white/10 bg-white/5 backdrop-blur-sm">
        <RightSidebar 
          activeRoom={activeRoom}
          activeConversation={activeConversation}
        />
      </div>
    </div>
  );
} 