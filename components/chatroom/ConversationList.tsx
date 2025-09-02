'use client';

import { useState, useEffect } from "react";
import { useSocket } from "@/lib/useSocket";

interface Conversation {
  _id: string;
  isGroup: boolean;
  name?: string;
  members: string[];
}

interface ConversationListProps {
  userId: string;
  token: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({ userId, token, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { socket, connect, isConnected } = useSocket();

  // Connexion au socket au chargement
  useEffect(() => {
    if (userId) {
      connect(userId);
    }
  }, [userId, connect]);

  // Fetch des conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des conversations :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token]);

  // Gestion de l'état en ligne via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit("user-online", userId);

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, [socket, userId, isConnected]);

  if (loading) return <div>Chargement des conversations...</div>;

  return (
    <div>
      <h2 className="mb-2 text-lg font-bold">Conversations</h2>
      <ul>
        {conversations.map((conv) => {
          const otherMembers = conv.members.filter((id) => id !== userId);
          const isOnline = otherMembers.some((id) => onlineUsers.includes(id));

          return (
            <li
              key={conv._id}
              onClick={() => onSelect(conv._id)}
              className="flex items-center justify-between p-2 mb-2 rounded cursor-pointer hover:bg-gray-200"
            >
              <span>
                {conv.isGroup ? conv.name || "Groupe sans nom" : otherMembers.join(", ")}
              </span>
              {isOnline && (
                <span
                  className="inline-block w-2 h-2 ml-2 bg-green-500 rounded-full"
                  title="En ligne"
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
