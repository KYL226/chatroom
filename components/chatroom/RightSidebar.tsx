'use client';

import { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, FileText, Link, ChevronDown, Bell } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Image from 'next/image';
// import SearchBar from '@/components/ui/SearchBar'; // Ligne commentée comme demandé

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline?: boolean;
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

interface RightSidebarProps {
  activeRoom: string | null;
  activeConversation: string | null;
}

export default function RightSidebar({ activeRoom, activeConversation }: RightSidebarProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [media, setMedia] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Array<{
    _id: string;
    name: string;
    type: string;
    url: string;
  }>>([]);
  const [attachments, setAttachments] = useState<Array<{
    _id: string;
    name: string;
    url: string;
    type: 'link' | 'file';
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [chatInfo, setChatInfo] = useState<{
    name: string;
    description?: string;
  } | null>(null);

  const fetchSidebarData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (activeRoom) {
        const roomRes = await fetch(`/api/rooms/${activeRoom}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setChatInfo({ name: roomData.room.name, description: roomData.room.description });
          setMembers(roomData.room.members || []);
        }
      } else if (activeConversation) {
        const convRes = await fetch(`/api/conversations/${activeConversation}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (convRes.ok) {
          const convData = await convRes.json();
          setChatInfo({ name: convData.conversation.name || 'Conversation privée' });
          setMembers(convData.conversation.members || []);
        }
      }

      const messagesRes = await fetch(`/api/messages?${activeRoom ? 'roomId' : 'conversationId'}=${activeRoom || activeConversation}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        const messages: Message[] = messagesData.messages || [];

        const allAttachments: Array<{
          _id: string;
          name: string;
          url: string;
          type: 'link' | 'file';
        }> = [];

        const allMedia: string[] = [];
        const allDocuments: Array<{
          _id: string;
          name: string;
          type: string;
          url: string;
        }> = [];

        messages.forEach(message => {
          if (message.attachments) {
            message.attachments.forEach(attachment => {
              if (attachment.type.startsWith('image/')) {
                allMedia.push(attachment.url);
              } else if (attachment.type === 'application/pdf' || attachment.type.includes('document')) {
                allDocuments.push({
                  _id: attachment._id,
                  name: attachment.name,
                  type: attachment.type,
                  url: attachment.url
                });
              } else {
                allAttachments.push({
                  _id: attachment._id,
                  name: attachment.name,
                  url: attachment.url,
                  type: 'file'
                });
              }
            });
          }
        });

        setMedia(allMedia.slice(0, 8));
        setDocuments(allDocuments.slice(0, 5));
        setAttachments(allAttachments.slice(0, 5));
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données de la sidebar:', error);
    } finally {
      setLoading(false);
    }
  }, [activeRoom, activeConversation]);

  useEffect(() => {
    if (activeRoom || activeConversation) {
      fetchSidebarData();
    } else {
      setMembers([]);
      setMedia([]);
      setDocuments([]);
      setAttachments([]);
      setChatInfo(null);
    }
  }, [activeRoom, activeConversation, fetchSidebarData]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!activeRoom && !activeConversation) {
    return (
      <div className="p-4 text-center text-white">
        <p>Sélectionnez une conversation pour voir les détails</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-white">
        <div className="animate-pulse">
          <div className="h-4 mb-4 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      {/* À propos */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="mb-3 text-sm font-semibold text-white">
          À propos de {chatInfo?.name || 'Chat'}
        </h3>
        {chatInfo?.description && (
          <p className="mb-3 text-xs text-white">{chatInfo.description}</p>
        )}
        <div className="flex items-center mb-3 space-x-2">
          {members.slice(0, 3).map((member) => (
            <div key={member._id} className="relative">
              <Avatar
                src={member.avatar}
                alt={member.name}
                size={32}
                fallback={getInitials(member.name)}
              />
              {member.isOnline && (
                <div className="absolute w-3 h-3 bg-green-500 border-2 border-white rounded-full -bottom-1 -right-1"></div>
              )}
            </div>
          ))}
          {members.length > 3 && (
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
              <span className="text-xs text-white">+{members.length - 3}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-white">{members.length} membre(s)</p>
      </div>

      {/* Notifications */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Me notifier pour toute activité</span>
          </div>
          <ChevronDown className="w-4 h-4 text-white" />
        </div>
        <p className="mt-1 text-xs text-white">Bureau et téléphone</p>
      </div>

      {/* Médias */}
      {media.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="flex items-center mb-3 text-sm font-semibold text-white">
            <ImageIcon className="w-4 h-4 mr-2 text-white" />
            Médias ({media.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {media.map((url, index) => (
              <div key={index} className="relative overflow-hidden bg-gray-200 rounded aspect-square">
                <Image
                  src={url}
                  alt={`media-${index}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="flex items-center mb-3 text-sm font-semibold text-white">
            <FileText className="w-4 h-4 mr-2 text-white" />
            Documents mentionnés ({documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100">
                <FileText className="w-4 h-4 mr-2 text-white" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{doc.name}</p>
                  <p className="text-xs text-white">{doc.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pièces jointes */}
      {attachments.length > 0 && (
        <div className="p-4">
          <h3 className="flex items-center mb-3 text-sm font-semibold text-white">
            <Link className="w-4 h-4 mr-2 text-white" />
            Pièces jointes ({attachments.length})
          </h3>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment._id} className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-100">
                <Link className="w-4 h-4 mr-2 text-white" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{attachment.name}</p>
                  <p className="text-xs text-white truncate">{attachment.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si rien */}
      {media.length === 0 && documents.length === 0 && attachments.length === 0 && (
        <div className="p-4 text-center text-white">
          <p className="text-sm">Aucun média ou document partagé</p>
        </div>
      )}
    </div>
  );
}
