'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useSocket } from '@/lib/useSocket';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Message {
  _id: string;
  content: string;
  sender: User;
  createdAt: Date;
  attachments?: Array<{
    _id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface Attachment {
  _id: string;
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  type: string;
}

interface ChatAreaProps {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  activeRoom?: string | null;
  activeConversation?: string | null;
}

interface ChatInfo {
  id: string;
  name: string;
  type: 'room' | 'conversation';
  members?: User[];
}

export default function ChatArea({ 
  user,
  activeRoom, 
  activeConversation
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected, connect } = useSocket();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Déterminer le chat actuel
  const chatId = activeRoom || activeConversation;
  const chatType = activeRoom ? 'room' : 'conversation';

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connexion Socket.io
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isConnected) {
      connect(token);
    }
  }, [isConnected, connect]);

  // Rejoindre/quitter les salles Socket.io quand connecté
  useEffect(() => {
    if (!socket || !isConnected || !chatId) return;
    if (chatType === 'room') {
      socket.emit('join_room', chatId);
      return () => {
        socket.emit('leave_room', chatId);
      };
    }
  }, [socket, isConnected, chatId, chatType]);

  // Écouter les événements Socket.io
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const handleMessageSent = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserTyping = (data: { userName: string; roomId: string }) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.userName)) {
          return [...prev, data.userName];
        }
        return prev;
      });
    };

    const handleUserStopTyping = (data: { userName: string; roomId: string }) => {
      setTypingUsers(prev => prev.filter(name => name !== data.userName));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket]);

  const fetchMessages = useCallback(async (params?: { before?: string; append?: boolean }) => {
    if (!chatId) return;
    const token = localStorage.getItem('token');
    const qs = new URLSearchParams();
    qs.set(chatType === 'room' ? 'roomId' : 'conversationId', chatId);
    qs.set('limit', '20');
    if (params?.before) qs.set('before', params.before);

    const res = await fetch(`/api/messages?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    setHasMore(Boolean(data.hasMore));
    setCursor(data.nextCursor || null);

    if (params?.append) {
      // On insère les anciens messages en tête en préservant le scroll
      const container = listContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      setMessages(prev => [...data.messages, ...prev]);
      // attendre le DOM update
      requestAnimationFrame(() => {
        const newScrollHeight = container?.scrollHeight || 0;
        const delta = newScrollHeight - prevScrollHeight;
        if (container) container.scrollTop = delta;
      });
    } else {
      setMessages(data.messages || []);
      // Scroll en bas pour les messages récents
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [chatId, chatType]);

  // Charger initialement les messages récents
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setHasMore(true);
      setCursor(null);
      return;
    }
    fetchMessages();
  }, [chatId, chatType, fetchMessages]);

  // Scroll top -> charger anciens
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (container.scrollTop <= 0 && hasMore && cursor) {
        fetchMessages({ before: cursor, append: true });
      }
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [hasMore, cursor, chatId, fetchMessages]);

  // Charger les messages et infos du chat
  useEffect(() => {
    if (!chatId) {
      setChatInfo(null);
      setMessages([]);
      return;
    }

    const fetchChatData = async () => {
      setLoading(true);
      try {
        // Charger les infos du chat
        const token = localStorage.getItem('token');
        
        // Récupérer les infos de la salle ou conversation
        const chatResponse = await fetch(`/api/${chatType === 'room' ? 'rooms' : 'conversations'}/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          const chatInfoData: ChatInfo = {
            id: chatData._id,
            name: chatType === 'room' ? chatData.name : chatData.title,
            type: chatType,
            members: chatType === 'room' ? chatData.members : chatData.participants
          };
          setChatInfo(chatInfoData);
        }

        // Charger les messages
        const messagesResponse = await fetch(`/api/messages?${chatType}Id=${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [chatId, chatType, fetchMessages]);

  const handleSendMessage = async (content: string, attachments?: Attachment[]) => {
    if (!chatId || (!content.trim() && (!attachments || attachments.length === 0))) return;

    try {
      const token = localStorage.getItem('token');
      const messageData = {
        content,
        attachments: attachments || [],
        [chatType === 'room' ? 'roomId' : 'conversationId']: chatId
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center flex-1 bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="mb-2 text-lg font-medium">Aucun chat sélectionné</h3>
          <p className="text-sm text-gray-500">Sélectionnez une conversation ou une salle pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-white">
      {/* En-tête du chat */}
      <div className="sticky top-0 z-10 p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {chatInfo?.name || 'Chat'}
            </h2>
            {chatType === 'room' && chatInfo?.members && (
              <p className="text-sm text-gray-500">
                {chatInfo.members.length} membre(s)
              </p>
            )}
          </div>
          
          {/* Indicateur de connexion Socket.io */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        {/* Indicateur de frappe */}
        {typingUsers.length > 0 && (
          <div className="mt-2 text-sm italic text-gray-500">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'tape' : 'tape(nt)'}...
          </div>
        )}
      </div>

      {/* Liste des messages scrollable */}
      <div 
        ref={listContainerRef} 
        className="flex-1 px-4 overflow-y-auto"
        style={{ scrollbarWidth: 'thin' /* optionnel pour Firefox */, WebkitOverflowScrolling: 'touch' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            currentUser={user}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie fixe en bas */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200">
        <MessageInput
          onSendMessage={handleSendMessage}
          roomId={chatType === 'room' ? chatId : undefined}
          conversationId={chatType === 'conversation' ? chatId : undefined}
          socket={socket}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}