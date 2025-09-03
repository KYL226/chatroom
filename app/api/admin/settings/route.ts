import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || '';

interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    maxUsersPerRoom: number;
    maxMessageLength: number;
    allowFileUploads: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  security: {
    requireEmailVerification: boolean;
    allowRegistration: boolean;
    minPasswordLength: number;
    requireStrongPassword: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
  };
  moderation: {
    enableAutoModeration: boolean;
    autoDeleteProfanity: boolean;
    requireApprovalForRooms: boolean;
    maxReportsBeforeBan: number;
    banDuration: number;
    enableWordFilter: boolean;
    filteredWords: string[];
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notifyOnReport: boolean;
    notifyOnNewUser: boolean;
    notifyOnRoomCreation: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    enableEmojis: boolean;
    enableMarkdown: boolean;
    showOnlineStatus: boolean;
  };
}

// Paramètres par défaut
const defaultSettings: Settings = {
  general: {
    siteName: 'ChatRoom',
    siteDescription: 'Plateforme de chat en temps réel',
    maxUsersPerRoom: 100,
    maxMessageLength: 1000,
    allowFileUploads: true,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  },
  security: {
    requireEmailVerification: true,
    allowRegistration: true,
    minPasswordLength: 8,
    requireStrongPassword: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableTwoFactor: false
  },
  moderation: {
    enableAutoModeration: true,
    autoDeleteProfanity: false,
    requireApprovalForRooms: false,
    maxReportsBeforeBan: 3,
    banDuration: 7,
    enableWordFilter: true,
    filteredWords: ['spam', 'insulte', 'racisme']
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    notifyOnReport: true,
    notifyOnNewUser: false,
    notifyOnRoomCreation: true
  },
  appearance: {
    theme: 'auto',
    primaryColor: '#3B82F6',
    enableEmojis: true,
    enableMarkdown: true,
    showOnlineStatus: true
  }
};

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis.' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    } catch {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou modérateur
    if (payload.role !== 'admin' && payload.role !== 'moderator') {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    await connectDB();
    
    // Pour l'instant, retourner les paramètres par défaut
    // Dans une vraie application, vous stockeriez ces paramètres en base de données
    return NextResponse.json({ settings: defaultSettings });

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis.' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    } catch {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé. Seuls les administrateurs peuvent modifier les paramètres.' }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: 'Paramètres requis.' }, { status: 400 });
    }

    await connectDB();
    
    // Pour l'instant, valider et retourner les paramètres
    // Dans une vraie application, vous sauvegarderiez ces paramètres en base de données
    
    // Validation basique des paramètres
    if (settings.general?.maxUsersPerRoom < 1 || settings.general?.maxMessageLength < 1) {
      return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
    }

    console.log('Paramètres mis à jour:', settings);
    
    return NextResponse.json({ 
      message: 'Paramètres mis à jour avec succès',
      settings 
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
