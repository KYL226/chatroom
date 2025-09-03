"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, LogOut, Shield } from "lucide-react";

interface User {
  _id: string;
  name: string;
  role: string;
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || "";
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/users/infos", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des infos utilisateur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin' || user.role === 'moderator';

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ChatRoom
            </Link>
            
            <div className="hidden space-x-6 md:flex">
              <Link
                href="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/" 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
              
              <Link
                href="/salles"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/salles") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Salles</span>
              </Link>
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin") 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Administration</span>
                </Link>
              )}
            </div>
          </div>

          {/* Menu utilisateur */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                <span className="text-sm font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 space-x-1 text-sm text-gray-600 transition-colors rounded-md hover:text-gray-900 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation mobile */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              pathname === "/" 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
          
          <Link
            href="/salles"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
              pathname.startsWith("/salles") 
                ? "bg-blue-100 text-blue-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Salles</span>
          </Link>
          
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                pathname.startsWith("/admin") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Administration</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
