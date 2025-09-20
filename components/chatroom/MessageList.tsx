'use client';

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { MoreVertical, Copy, Trash2 } from 'lucide-react';
import EmojiDisplay from '@/components/ui/EmojiDisplay';
import Avatar from '@/components/ui/Avatar';
import ReportButton from '@/components/ui/ReportBoutton';

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

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

export default function MessageList({ messages, currentUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Cette fonction n'est plus utilisée car le scroll est géré par le parent
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (date: Date | string) => {
    try {
      const messageDate = new Date(date);
      if (isNaN(messageDate.getTime())) {
        console.warn('Date invalide reçue:', date);
        return '';
      }

      const now = new Date();
      const diffInMinutes = (now.getTime() - messageDate.getTime()) / (1000 * 60);

      if (diffInMinutes < 1) {
        return 'À l\'instant';
      } else if (diffInMinutes < 60) {
        return `Il y a ${Math.floor(diffInMinutes)} min`;
      } else if (diffInMinutes < 1440) {
        return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
      } else if (diffInMinutes < 10080) {
        return format(messageDate, 'EEEE', { locale: fr });
      } else {
        return format(messageDate, 'dd/MM/yyyy', { locale: fr });
      }
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  };

  const isOwnMessage = (message: Message) => {
    return message.sender._id === currentUser._id;
  };

  const canModerate = () => {
    return currentUser.role === 'admin' || currentUser.role === 'moderator';
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setOpenMenu(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!canModerate()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Recharger les messages ou mettre à jour l'état
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
    
    setOpenMenu(null);
  };

  const renderAttachment = (attachment: {
    _id: string;
    name: string;
    url: string;
    type: string;
  }) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <div key={attachment._id} className="mt-2">
          <a href={attachment.url} target="_blank" rel="noreferrer">
            <Image
              src={attachment.url}
              alt={attachment.name}
              width={200}
              height={150}
              className="object-cover rounded-lg hover:opacity-90"
            />
          </a>
        </div>
      );
    } else if (attachment.type === 'application/pdf') {
      return (
        <div key={attachment._id} className="p-3 mt-2 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded">
                <span className="text-xs font-bold text-white">PDF</span>
              </div>
              <div>
                <div className="text-sm font-medium">{attachment.name}</div>
                <div className="text-xs text-gray-500">Document PDF</div>
              </div>
            </div>
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Ouvrir
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div key={attachment._id} className="p-3 mt-2 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded">
                <span className="text-xs font-bold text-white">FIC</span>
              </div>
              <div>
                <div className="text-sm font-medium">{attachment.name}</div>
                <div className="text-xs text-gray-500">Fichier joint</div>
              </div>
            </div>
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Télécharger
            </a>
          </div>
        </div>
      );
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="mb-2 text-lg font-medium">Aucun message</h3>
          <p className="text-sm">Soyez le premier à envoyer un message !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const own = isOwnMessage(message);

        return (
          <div
            key={message._id}
            className={`flex ${own ? 'justify-end' : 'justify-start'} group`}
          >
            <div className={`flex max-w-xs lg:max-w-md ${own ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 ${own ? 'ml-3' : 'mr-3'}`}>
                <Avatar
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  size={32}
                  fallback={getInitials(message.sender.name)}
                />
              </div>

              <div className={`flex flex-col ${own ? 'items-end' : 'items-start'} relative`}>
                {!own && (
                  <div className="mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {message.sender.name}
                    </span>
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-lg relative ${
                    own
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content && message.content.trim() && (
                    <p className="text-sm break-words whitespace-pre-wrap">
                      <EmojiDisplay text={message.content} />
                    </p>
                  )}

                  {message.attachments && message.attachments.length > 0 && (
                    <div className={`space-y-2 ${message.content && message.content.trim() ? 'mt-2' : ''}`}>
                      {message.attachments.map(renderAttachment)}
                    </div>
                  )}

                  {/* Menu contextuel */}
                  <div className={`absolute top-1 ${own ? 'left-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === message._id ? null : message._id)}
                        className={`p-1 rounded hover:bg-black hover:bg-opacity-10 ${
                          own ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenu === message._id && (
                        <div className={`absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 ${own ? 'left-0' : 'right-0'}`}>
                          <div className="py-1">
                            <button
                              onClick={() => handleCopyMessage(message.content)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                            >
                              <Copy className="w-4 h-4 mr-3" />
                              Copier le message
                            </button>
                            
                            <ReportButton
                              type="message"
                              targetId={message._id}
                              targetName={`Message de ${message.sender.name}`}
                              targetContent={message.content}
                              variant="menu"
                            />

                            {canModerate() && (
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Supprimer le message
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`mt-1 ${own ? 'text-right' : 'text-left'}`}>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}