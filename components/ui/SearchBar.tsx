'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Hash, X } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import Avatar from '@/components/ui/Avatar';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  role: string;
}

interface Room {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  createdAt: string;
}

interface SearchResult {
  users?: User[];
  rooms?: Room[];
}

interface SearchBarProps {
  onUserSelect?: (user: User) => void;
  onRoomSelect?: (room: Room) => void;
  placeholder?: string;
  className?: string;
  showTypeFilter?: boolean;
}

export default function SearchBar({
  onUserSelect,
  onRoomSelect,
  placeholder = "Rechercher des utilisateurs ou des salles...",
  className = "",
  showTypeFilter = true
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'users' | 'rooms'>('all');
  const [error, setError] = useState('');
  
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({});
      setShowResults(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}&type=${searchType}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la recherche');
        }

        const data = await response.json();
        setResults(data.data || {});
        setShowResults(true);
      } catch (err) {
        setError('Erreur lors de la recherche');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchType]);

  const handleUserSelect = (user: User) => {
    onUserSelect?.(user);
    setShowResults(false);
    setQuery('');
  };

  const handleRoomSelect = (room: Room) => {
    onRoomSelect?.(room);
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults({});
    setShowResults(false);
    setError('');
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showTypeFilter && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setSearchType('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              searchType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setSearchType('users')}
            className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 ${
              searchType === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Users className="w-3 h-3" />
            Utilisateurs
          </button>
          <button
            onClick={() => setSearchType('rooms')}
            className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 ${
              searchType === 'rooms'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Hash className="w-3 h-3" />
            Salles
          </button>
        </div>
      )}

      {showResults && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg top-full max-h-96">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Recherche en cours...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              {results.users && results.users.length > 0 && (
                <div className="p-2">
                  <h3 className="flex items-center gap-1 mb-2 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4" />
                    Utilisateurs ({results.users.length})
                  </h3>
                  {results.users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                    >
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        size={32}
                        fallback={user.name.charAt(0).toUpperCase()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        {user.bio && (
                          <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.rooms && results.rooms.length > 0 && (
                <div className="p-2">
                  <h3 className="flex items-center gap-1 mb-2 text-sm font-semibold text-gray-700">
                    <Hash className="w-4 h-4" />
                    Salles ({results.rooms.length})
                  </h3>
                  {results.rooms.map((room) => (
                    <div
                      key={room._id}
                      onClick={() => handleRoomSelect(room)}
                      className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-green-500 rounded-full">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{room.name}</div>
                        {room.description && (
                          <p className="text-sm text-gray-500 truncate">{room.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {room.members.length} membres
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!results.users || results.users.length === 0) && 
               (!results.rooms || results.rooms.length === 0) && (
                <div className="p-4 text-center text-gray-500">
                  Aucun résultat trouvé
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 