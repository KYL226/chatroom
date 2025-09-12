'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  MessageCircle, 
  Hash, 
  Users, 
  FileText, 
  User,
  LogOut,
  ChevronDown,
  Link
} from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import Avatar from '@/components/ui/Avatar';
import ReportButton from '@/components/ui/ReportBoutton';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline?: boolean;
  isBanned?: boolean; // Added for filtering banned users
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  messageCount?: number;
}

interface Conversation {
  _id: string;
  name?: string;
  members: User[];
  lastMessage?: {
    content: string;
    sender: User;
    createdAt: Date;
  };
  unreadCount?: number;
  updatedAt: Date;
}

interface LeftSidebarProps {
  user: User;
  onRoomSelect: (roomId: string) => void;
  onConversationSelect: (conversationId: string) => void;
  activeRoom: string | null;
  activeConversation: string | null;
}

export default function LeftSidebar({ 
  user, 
  onRoomSelect, 
  onConversationSelect, 
  activeRoom, 
  activeConversation 
}: LeftSidebarProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const response = await fetch('/api/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      } else {
        console.error('Erreur lors du chargement des salles:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error('Erreur lors du chargement des conversations:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrer l'utilisateur actuel et les utilisateurs bannis
        const filteredUsers = data.users.filter((u: User) => 
          u._id !== user._id && !u.isBanned
        );
        setContacts(filteredUsers);
      } else {
        console.error('Erreur lors du chargement des contacts:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchRooms();
    fetchConversations();
    fetchContacts();
  }, [fetchRooms, fetchConversations, fetchContacts]);

  // Rafraîchir les contacts toutes les 30 secondes pour le statut en ligne
  useEffect(() => {
    const interval = setInterval(() => {
      fetchContacts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchContacts]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    console.log("Déconnexion - Suppression du token");
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profil');
    setShowUserMenu(false);
  };

  // Ajouter cette fonction pour créer une conversation privée
  const createPrivateConversation = async (contactId: string) => {
    try {
      // Vérifier que l'utilisateur est connecté
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vous devez être connecté pour créer une conversation privée');
        return;
      }

      console.log('Création de conversation privée avec:', contactId);
      console.log('Token disponible:', token ? 'Oui' : 'Non');
      console.log('Token (premiers caractères):', token.substring(0, 20) + '...');

      // D'abord vérifier si une conversation existe déjà
      const checkResponse = await fetch('/api/conversations/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          memberId: contactId
        })
      });

      console.log('Réponse de vérification:', checkResponse.status);

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log('Données de vérification:', checkData);
        
        if (checkData.exists) {
          // Si la conversation existe déjà, la sélectionner
          console.log('Conversation existante trouvée:', checkData.conversation._id);
          onConversationSelect(checkData.conversation._id);
          return;
        }
      } else {
        const errorText = await checkResponse.text();
        console.error('Erreur lors de la vérification de la conversation:', checkResponse.status, errorText);
        alert(`Erreur lors de la vérification: ${checkResponse.status}`);
        return;
      }

      // Créer une nouvelle conversation si elle n'existe pas
      console.log('Création d\'une nouvelle conversation...');
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          memberIds: [contactId]
        })
      });

      console.log('Réponse de création:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Conversation créée avec succès:', data);
        // Sélectionner automatiquement la nouvelle conversation
        onConversationSelect(data.conversation._id);
        // Rafraîchir la liste des conversations
        fetchConversations();
      } else {
        const errorText = await response.text();
        console.error('Erreur lors de la création de la conversation:', response.status, errorText);
        // Afficher un message d'erreur à l'utilisateur
        alert(`Erreur lors de la création de la conversation: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur de connexion: ${errorMessage}`);
    }
  };

 // Fonction de débogage pour vérifier l'état de l'authentification
const debugAuth = useCallback(() => {
  const token = localStorage.getItem('token');
  console.log('=== DEBUG AUTH ===');
  console.log('Token présent:', !!token);
  if (token) {
    console.log('Token (premiers caractères):', token.substring(0, 20) + '...');
    console.log('Longueur du token:', token.length);
  }
  console.log('User object:', user);
  console.log('==================');
}, [user]);
  
// Appeler debugAuth au chargement du composant
useEffect(() => {
  debugAuth();
}, [debugAuth]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    
    // Pour les conversations privées, afficher les noms des autres membres
    const otherMembers = conversation.members.filter(member => member._id !== user._id);
    if (otherMembers.length === 1) {
      return otherMembers[0].name;
    } else if (otherMembers.length > 1) {
      return `${otherMembers[0].name} +${otherMembers.length - 1}`;
    }
    
    return 'Conversation privée';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 jours
      return messageDate.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  return (
    <div className="flex flex-col bg-transparent border-r w-80 border-white/10">
      {/* En-tête avec profil utilisateur */}
      <div className="p-4 border-b border-white/10 user-menu-container bg-white/5 backdrop-blur-sm">
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between w-full p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.avatar}
                alt={user.name}
                size={40}
                fallback={getInitials(user.name)}
              />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu déroulant */}
          {showUserMenu && (
            <div className="absolute left-0 right-0 z-50 mt-1 border rounded-lg shadow-xl bg-white/90 backdrop-blur-md border-white/20 top-full">
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-800 transition-colors hover:bg-white/60"
                >
                  <User className="w-4 h-4 mr-3" />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-100/70"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="p-4">
        <SearchBar />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Liens statiques */}
        <div className="px-4 py-2">
          <div className="space-y-1">
            <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-white/80 hover:bg-white/10">
              <FileText className="w-4 h-4 mr-3" />
              Documentation
            </a>
            <Link href="/salles" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-white/80 hover:bg-white/10">
              <Users className="w-4 h-4 mr-3" />
              Explorer les salles
            </Link>
          </div>
        </div>

        {/* Salles de chat */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-white/60">
              Salles de chat
            </h3>
            <button className="p-1 rounded hover:bg-white/10">
              <Plus className="w-4 h-4 text-white/80" />
            </button>
          </div>
          
          {roomsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-white/10 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="flex items-center group"
                >
                  <button
                    onClick={() => onRoomSelect(room._id)}
                    className={`flex items-center flex-1 px-2 py-2 text-sm rounded-md transition-colors ${
                      activeRoom === room._id
                        ? 'bg-white/15 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Hash className="w-4 h-4 mr-3" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{room.name}</div>
                      {room.description && (
                        <div className="text-xs truncate text-white/60">{room.description}</div>
                      )}
                    </div>
                    {room.members && (
                      <div className="text-xs text-white/60">{room.members.length}</div>
                    )}
                  </button>
                  
                  {/* Bouton de signalement */}
                  <div className="mr-2 transition-opacity opacity-0 group-hover:opacity-100">
                    <ReportButton
                      type="room"
                      targetId={room._id}
                      targetName={room.name}
                      targetContent={room.description}
                      variant="icon"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversations privées */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-white/60">
              Conversations privées
            </h3>
            <button className="p-1 rounded hover:bg-white/10">
              <Plus className="w-4 h-4 text-white/80" />
            </button>
          </div>
          
          {conversationsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-white/10 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation._id)}
                  className={`w-full flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                    activeConversation === conversation._id
                      ? 'bg-white/15 text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{getConversationName(conversation)}</div>
                    {conversation.lastMessage && (
                      <div className="text-xs truncate text-white/60">
                        {conversation.lastMessage.sender.name}: {conversation.lastMessage.content}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {conversation.lastMessage && (
                      <div className="text-xs text-white/60">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </div>
                    )}
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <div className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="px-4 py-2">
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Contacts
          </h3>
          
          {contactsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full animate-pulse bg-white/10"></div>
                  <div className="flex-1">
                    <div className="h-4 rounded animate-pulse bg-white/10"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center group"
                >
                  <button
                    onClick={() => createPrivateConversation(contact._id)}
                    className="flex items-center flex-1 px-2 py-2 text-sm transition-colors rounded-md hover:bg-white/10"
                  >
                    <div className="relative">
                      <Avatar
                        src={contact.avatar}
                        alt={contact.name}
                        size={32}
                        fallback={getInitials(contact.name)}
                      />
                      {/* Corriger l'affichage du statut en ligne */}
                      <div className={`absolute w-3 h-3 border-2 border-white rounded-full -bottom-1 -right-1 ${
                        contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 ml-3 text-left">
                      <div className="font-medium text-white">{contact.name}</div>
                      <div className="text-xs text-white/60">{contact.email}</div>
                    </div>
                  </button>
                  
                  {/* Bouton de signalement */}
                  <div className="mr-2 transition-opacity opacity-0 group-hover:opacity-100">
                    <ReportButton
                      type="user"
                      targetId={contact._id}
                      targetName={contact.name}
                      variant="icon"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
