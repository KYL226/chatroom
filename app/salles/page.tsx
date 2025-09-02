"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, Users, MessageCircle, Lock, Unlock } from "lucide-react";

interface Room {
  _id: string;
  name: string;
  description: string;
  isPublic: boolean;
  memberCount?: number;
  isMember?: boolean;
}

export default function SallesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [token, setToken] = useState("");

  // Charger le token depuis le localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch("/api/rooms", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRooms(data.rooms || []);
      } else {
        setError(data.error || "Erreur lors du chargement des salles");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchRooms();
    }
  }, [token, fetchRooms]);

  useEffect(() => {
    // Filtrer les salles selon la recherche
    const filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRooms(filtered);
  }, [searchTerm, rooms]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess("Vous avez rejoint la salle avec succès !");
        // Mettre à jour la liste des salles
        fetchRooms();
        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Erreur lors de la jointure");
      }
    } catch {
      setError("Erreur de connexion");
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess("Vous avez quitté la salle avec succès !");
        fetchRooms();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Erreur lors de la sortie");
      }
    } catch {
      setError("Erreur de connexion");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Salles de discussion</h1>
          <p className="text-gray-600">
            Rejoignez les salles publiques pour discuter avec d&apos;autres utilisateurs
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Rechercher une salle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Grille des salles */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <div key={room._id} className="transition-shadow bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                  <div className="flex items-center gap-1">
                    {room.isPublic ? (
                      <Unlock className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <p className="mb-4 text-gray-600 line-clamp-2">{room.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.memberCount || 0} membres</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Discussion</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {room.isMember ? (
                    <>
                      <button
                        onClick={() => window.location.href = `/salles/${room._id}`}
                        className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Entrer
                      </button>
                      <button
                        onClick={() => handleLeaveRoom(room._id)}
                        className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Quitter
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoinRoom(room._id)}
                      className="w-full px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucune salle trouvée */}
        {filteredRooms.length === 0 && !loading && (
          <div className="py-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm ? "Aucune salle trouvée" : "Aucune salle disponible"}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? "Essayez de modifier vos critères de recherche"
                : "Les salles seront créées par les administrateurs"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}