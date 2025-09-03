import { Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Types pour les filtres de requête
export interface MessageFilter {
  conversation?: string;
  room?: string;
  sender?: string;
  createdAt?: {
    $lt?: Date;
    $gt?: Date;
  };
}

export interface ReportFilter {
  status?: string;
  reporter?: string;
  reportedUser?: string;
  createdAt?: {
    $lt?: Date;
    $gt?: Date;
  };
}

export interface UserFilter {
  role?: string;
  isOnline?: boolean;
  isBanned?: boolean;
  name?: {
    $regex: string;
    $options: string;
  };
}

// Types pour les utilisateurs
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  isBanned: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export {}; 