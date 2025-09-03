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
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-white/70">Chargement des salles...</p>
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
            <h1 className="mb-2 text-3xl font-bold">Gestion des Salles</h1>
            <p className="text-white/70">
              Créez et gérez les salles de discussion de la plateforme
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-4 h-4" />
            Créer une salle
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 text-white border rounded-lg placeholder-white/50 border-white/15 bg-black/20 focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
          />
        </div>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="p-4 mb-4 border rounded-lg border-rose-300/40 bg-rose-500/10">
          <p className="text-rose-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 mb-4 border rounded-lg border-emerald-300/40 bg-emerald-500/10">
          <p className="text-emerald-300">{success}</p>
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="p-6 mb-6 border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold">Créer une nouvelle salle</h3>
          <form onSubmit={handleCreateRoom}>
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-white/80">
                  Nom de la salle
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-white border rounded-lg bg-black/20 border-white/15 focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-white/80">
                  Type de salle
                </label>
                <select
                  value={formData.isPublic ? "public" : "private"}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "public" })}
                  className="w-full px-3 py-2 text-white border rounded-lg bg-black/20 border-white/15 focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                >
                  <option value="public">Publique</option>
                  <option value="private">Privée</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-white/80">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-white border rounded-lg bg-black/20 border-white/15 focus:ring-2 focus:ring-indigo-500/60 focus:border-transparent"
                placeholder="Description de la salle..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-500"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", description: "", isPublic: true });
                }}
                className="px-4 py-2 transition-colors border rounded-lg border-white/15 hover:bg-white/10"
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
          <div key={room._id} className="transition-shadow border rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm hover:shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">{room.name}</h3>
                <div className="flex items-center gap-1">
                  {room.isPublic ? (
                    <Unlock className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              <p className="mb-4 text-white/70 line-clamp-2">{room.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-white/70">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{room.memberCount || 0} membres</span>
                </div>
                <div className="text-sm text-white/70">
                  {new Date(room.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/salles/${room._id}`}
                  className="flex-1 px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-500"
                >
                  Voir
                </button>
                <button
                  onClick={() => handleDeleteRoom(room._id)}
                  className="px-4 py-2 transition-colors border rounded-lg border-rose-300/40 text-rose-300 hover:bg-rose-500/10"
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
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="mb-2 text-lg font-medium">
            {searchTerm ? "Aucune salle trouvée" : "Aucune salle créée"}
          </h3>
          <p className="text-white/70">
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
