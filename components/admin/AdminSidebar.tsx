"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  Settings, 
  Shield,
  AlertTriangle,
  Home,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface MenuChild {
  href: string;
  label: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  children: MenuChild[];
}

interface AdminSidebarProps {
  user: User | null;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart3,
      href: '/admin',
      children: []
    },
    {
      id: 'rooms',
      label: 'Gestion des salles',
      icon: MessageCircle,
      href: '/admin/salles',
      children: []
    },
    {
      id: 'users',
      label: 'Gestion des utilisateurs',
      icon: Users,
      href: '/admin/users',
      children: []
    },
    {
      id: 'reports',
      label: 'Signalements',
      icon: AlertTriangle,
      href: '/admin/reports',
      children: []
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      href: '/admin/settings',
      children: []
    }
  ];

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.admin-user-menu-container')) {
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
    console.log("Déconnexion admin - Suppression du token");
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/profil');
    setShowUserMenu(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  // Si pas d'utilisateur, ne rien afficher
  if (!user) {
    return null;
  }

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-lg">
      {/* Header avec menu utilisateur */}
      <div className="p-6 border-b border-gray-200 admin-user-menu-container">
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between w-full p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Administration</h2>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu déroulant utilisateur */}
          {showUserMenu && (
            <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user?.avatar}
                    alt={user?.name || 'User'}
                    size={32}
                    fallback={getInitials(user?.name || 'A')}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <User className="w-4 h-4 mr-3" />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const active = isActive(item.href);

            return (
              <li key={item.id}>
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        active
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                    
                    {expandedMenu === item.id && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.children.map((child: MenuChild) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                isActive(child.href)
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      active
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <Link
          href="/chatroom"
          className="flex items-center px-3 py-2 space-x-2 text-sm text-gray-600 transition-colors rounded-md hover:text-gray-900 hover:bg-gray-50"
        >
          <Home className="w-4 h-4" />
          <span>Retour au chat</span>
        </Link>
      </div>
    </div>
  );
}
