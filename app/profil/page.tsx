"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  avatar: z.string().url("URL d'avatar invalide").optional().or(z.literal("")),
  bio: z.string().max(200, "200 caractères max").optional().or(z.literal("")),
  interests: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  bio?: string;
  interests?: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/users/infos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // Pré-remplir le formulaire avec les données utilisateur
          setValue("name", data.user.name || "");
          setValue("avatar", data.user.avatar || "");
          setValue("bio", data.user.bio || "");
          setValue("interests", data.user.interests || "");
        } else {
          console.error('Erreur lors du chargement du profil');
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadUser();
  }, [setValue, router]);

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setSuccess("");
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/infos', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Erreur serveur");
      }
      
      setSuccess("Profil mis à jour avec succès !");
      
      // Mettre à jour les données utilisateur locales avec vérification de type
      if (user) {
        setUser({
          ...user,
          name: data.name,
          avatar: data.avatar || user.avatar,
          bio: data.bio || user.bio,
          interests: data.interests || user.interests,
        });
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setServerError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement du profil</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-2xl px-4 mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
            <button 
              onClick={() => router.push('/chatroom')}
              className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              ← Retour au chat
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar preview */}
            <div className="flex items-center space-x-4">
              <Avatar
                src={user.avatar}
                alt={user.name}
                size={80}
                fallback={user.name?.charAt(0).toUpperCase()}
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input 
                  type="text" 
                  {...register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  URL de l&apos;avatar
                </label>
                <input 
                  type="url" 
                  {...register("avatar")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
                {errors.avatar && (
                  <p className="mt-1 text-sm text-red-600">{errors.avatar.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Biographie
              </label>
              <textarea 
                {...register("bio")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Parlez-nous un peu de vous..."
                maxLength={200}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Centres d&apos;intérêt
              </label>
              <input 
                type="text" 
                {...register("interests")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Vos centres d'intérêt, séparés par des virgules"
              />
              {errors.interests && (
                <p className="mt-1 text-sm text-red-600">{errors.interests.message}</p>
              )}
            </div>

            {/* Messages d'erreur et de succès */}
            {serverError && (
              <div className="p-4 border border-red-200 rounded-md bg-red-50">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 border border-green-200 rounded-md bg-green-50">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button 
                type="button"
                onClick={() => router.push('/chatroom')}
                className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Mise à jour..." : "Mettre à jour le profil"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
