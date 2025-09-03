"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Users, MessageCircle, Lock, Unlock, Trash2 } from "lucide-react";

interface Room {
  _id: string;
  name: string;
  description: string;
  isPublic: boolean;
  memberCount?: number;
  createdAt: string;
}

export default function AdminSallesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true
  });

  const [token, setToken] = useState("");

  const fetchRooms = useCallback(async () => {
    try {
      console.log("Token utilisé pour /api/admin/rooms:", token); // Debug
      const response = await fetch("/api/admin/rooms", {
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

  // Charger le token depuis le localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem('token') || "";
      setToken(storedToken);
    }
  }, []);

  // Appeler fetchRooms uniquement quand le token est prêt
  useEffect(() => {
    if (token) {
      fetchRooms();
    }
  }, [token, fetchRooms]);

  useEffect(() => {
    const filtered = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRooms(filtered);
  }, [searchTerm, rooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Salle créée avec succès !");
        setShowForm(false);
        setFormData({ name: "", description: "", isPublic: true });
        fetchRooms();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Erreur lors de la création");
      }
    } catch {
      setError("Erreur de connexion");
    }
  };

    const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) return;

    try {
      const response = await fetch(`/api/admin/rooms?id=${roomId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess("Salle supprimée avec succès !");
        fetchRooms();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Erreur lors de la suppression");
      }
    } catch {
      setError("Erreur de connexion");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Gestion des Salles</h1>
            <p className="text-gray-600">
              Créez et gérez les salles de discussion de la plateforme
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Créer une salle
          </button>
        </div>
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

      {/* Formulaire de création */}
      {showForm && (
        <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Créer une nouvelle salle</h3>
          <form onSubmit={handleCreateRoom}>
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nom de la salle
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Type de salle
                </label>
                <select
                  value={formData.isPublic ? "public" : "private"}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "public" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Publique</option>
                  <option value="private">Privée</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description de la salle..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", description: "", isPublic: true });
                }}
                className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
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
                <div className="text-sm text-gray-500">
                  {new Date(room.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/salles/${room._id}`}
                  className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Voir
                </button>
                <button
                  onClick={() => handleDeleteRoom(room._id)}
                  className="px-4 py-2 text-red-600 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
            {searchTerm ? "Aucune salle trouvée" : "Aucune salle créée"}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par créer votre première salle"
            }
          </p>
        </div>
      )}
    </div>
  );
}
