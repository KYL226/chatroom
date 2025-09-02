"use client";
import { useCallback, useEffect, useState } from "react";
import MessageList from "@/components/chatroom/MessageList";
import MessageInput from "@/components/chatroom/MessageInput";
import { useParams } from "next/navigation";

type UIUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

type UIMessageAttachment = {
  _id: string;
  name?: string; // API may return 'name' or 'originalName'; tolerate both
  originalName?: string;
  url: string;
  type: string;
  size?: number;
};

type UIMessage = {
  _id: string;
  content: string;
  sender: UIUser;
  createdAt: string | Date;
  attachments?: UIMessageAttachment[];
};

type MessageForList = {
  _id: string;
  content: string;
  sender: UIUser;
  createdAt: Date;
  attachments?: {
    _id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
};

type UIRoom = {
  _id: string;
  name: string;
  description?: string;
  // members are populated users for display
  members: { _id: string; name: string; email: string }[];
  // admins/moderators are arrays of user ids (used with includes)
  admins: string[];
  moderators: string[];
};

export default function RoomChatPage() {
  const { id } = useParams();
  const [token, setToken] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [room, setRoom] = useState<UIRoom | null>(null);
  const [user, setUser] = useState<UIUser | null>(null);
  const [messages, setMessages] = useState<MessageForList[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // Charger le token depuis le localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  // Récupérer les infos utilisateur
  useEffect(() => {
    if (token) {
      fetch('/api/users/infos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setUser(data.user));
    }
  }, [token]);

  // Récupérer les infos de la salle
  useEffect(() => {
    if (token && id) {
      fetch(`/api/rooms/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setRoom(data.room as UIRoom))
      .catch(error => console.error('Erreur lors du chargement de la salle:', error));
    }
  }, [id, token]);

  const normalizeMessage = (m: UIMessage): MessageForList => ({
    _id: m._id,
    content: m.content,
    sender: m.sender,
    createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
    attachments: m.attachments?.map(att => ({
      _id: att._id,
      name: att.name ?? att.originalName ?? 'Fichier',
      url: att.url,
      type: att.type,
      size: att.size
    }))
  });

  const fetchRoomMessages = useCallback(async (opts?: { before?: string; append?: boolean }) => {
    if (!token || !id) return;
    const qs = new URLSearchParams();
    qs.set('roomId', String(id));
    qs.set('limit', '10');
    if (opts?.before) qs.set('before', opts.before);

    const res = await fetch(`/api/messages?${qs.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    setHasMore(Boolean(data.hasMore));
    setCursor(data.nextCursor || null);

    if (opts?.append) {
      const container = document.getElementById('roomMessages');
      const prevHeight = container?.scrollHeight || 0;
      setMessages(prev => [...(data.messages as UIMessage[]).map(normalizeMessage), ...prev]);
      requestAnimationFrame(() => {
        const newHeight = container?.scrollHeight || 0;
        const delta = newHeight - prevHeight;
        if (container) container.scrollTop = delta;
      });
    } else {
      setMessages(((data.messages as UIMessage[]) || []).map(normalizeMessage));
      requestAnimationFrame(() => {
        const container = document.getElementById('roomMessages');
        if (container) container.scrollTop = container.scrollHeight;
      });
    }
  }, [id, token]);

  useEffect(() => {
    if (token && id) fetchRoomMessages();
  }, [id, token, refresh, fetchRoomMessages]);

  useEffect(() => {
    const container = document.getElementById('roomMessages');
    if (!container) return;
    const onScroll = () => {
      if (container.scrollTop <= 0 && hasMore && cursor) {
        fetchRoomMessages({ before: cursor, append: true });
      }
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [hasMore, cursor, id, fetchRoomMessages]);

  // Récupérer la liste des membres (affichage noms)
  const [members, setMembers] = useState<{_id: string, name: string, email: string}[]>([]);
  useEffect(() => {
    if (!room || !room.members || room.members.length === 0) return setMembers([]);
    // Les membres sont déjà populés dans la réponse de l'API room
    setMembers(room.members || []);
  }, [room]);

  // Vérifier si l'utilisateur est membre de la salle
  const [isMember, setIsMember] = useState(false);
  useEffect(() => {
    if (!room || !room.members || !user) return;
    setIsMember(room.members.some((member) => member._id === user._id));
  }, [room, user]);

  // Récupérer le rôle de l'utilisateur connecté dans la salle
  const [myRole, setMyRole] = useState<'admin' | 'moderator' | 'member' | null>(null);
  useEffect(() => {
    if (!room || !user) return;
    if (room.admins && room.admins.some((adminId) => adminId === user._id)) setMyRole('admin');
    else if (room.moderators && room.moderators.some((modId) => modId === user._id)) setMyRole('moderator');
    else if (room.members && room.members.some((member) => member._id === user._id)) setMyRole('member');
    else setMyRole(null);
  }, [room, user]);

  // Handler pour rejoindre/quitter la salle
  const handleJoin = async () => {
    await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ roomId: id }),
    });
    window.location.reload();
  };
  const handleLeave = async () => {
    await fetch("/api/rooms/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ roomId: id }),
    });
    window.location.reload();
  };

  // Handler pour bannir un membre (admin/modérateur)
  const handleBan = async (userId: string) => {
    await fetch('/api/rooms/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ roomId: id, userId }),
    });
    window.location.reload();
  };

  // Handler pour promouvoir/dégrader un modérateur (admin)
  const handleModerate = async (userId: string, action: 'promote' | 'demote') => {
    await fetch('/api/rooms/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ roomId: id, userId, action }),
    });
    window.location.reload();
  };

  type InputAttachment = {
    _id: string;
    originalName: string;
    fileName: string;
    url: string;
    size: number;
    type: string;
  };

  // Handler pour envoyer un message
  const handleSendMessage = async (content: string, attachments?: InputAttachment[]) => {
    if ((!content || !content.trim()) && (!attachments || attachments.length === 0)) return;

    try {
      const messageData = {
        content,
        attachments: attachments || [],
        roomId: id
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
        // Recharger les messages
        setRefresh(r => r + 1);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded shadow md:mt-6">
      <div className="sticky top-0 z-10 p-6 pb-2 bg-white">
        <h1 className="mb-2 text-2xl font-bold">{room?.name || "Salle"}</h1>
        <div className="mb-2 text-gray-600">{room?.description}</div>
        <div className="mb-2">
          <span className="font-semibold">Membres :</span>
          <ul>
            {members.map(m => (
              <li key={m._id} className="flex items-center gap-2">
                {m.name}
                {room?.admins?.includes(m._id) && <span className="text-xs text-blue-600">[admin]</span>}
                {room?.moderators?.includes(m._id) && !room?.admins?.includes(m._id) && <span className="text-xs text-green-600">[modo]</span>}
                {myRole && (myRole === 'admin' || myRole === 'moderator') && token && m._id !== JSON.parse(atob(token.split('.')[1])).userId && (
                  <button onClick={() => handleBan(m._id)} className="ml-2 text-xs text-white bg-red-500 rounded px-2 py-0.5 hover:bg-red-700">Bannir</button>
                )}
                {myRole === 'admin' && token && m._id !== JSON.parse(atob(token.split('.')[1])).userId && (
                  <>
                    {room?.moderators?.includes(m._id) ? (
                      <button onClick={() => handleModerate(m._id, 'demote')} className="ml-2 text-xs text-white bg-yellow-500 rounded px-2 py-0.5 hover:bg-yellow-700">Rétrograder</button>
                    ) : (
                      <button onClick={() => handleModerate(m._id, 'promote')} className="ml-2 text-xs text-white bg-blue-500 rounded px-2 py-0.5 hover:bg-blue-700">Promouvoir modo</button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-2">
          {isMember ? (
            <button onClick={handleLeave} className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700">Quitter la salle</button>
          ) : (
            <button onClick={handleJoin} className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700">Rejoindre la salle</button>
          )}
        </div>
      </div>

      {/* Zone messages + saisie */}
      <div className="flex flex-col px-6 pb-6">
        <div id="roomMessages" className="overflow-y-auto overscroll-contain h-[65vh] mb-4">
          {user ? <MessageList messages={messages} currentUser={user} /> : null}
        </div>
        <MessageInput 
          onSendMessage={handleSendMessage}
          roomId={id as string}
        />
      </div>
    </div>
  );
}