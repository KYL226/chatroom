import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    try {
      await connectDB();
      
      const users = await User.find({}).select('-password').sort({ name: 1 });
      
      const formattedUsers = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }));

      return NextResponse.json({ users: formattedUsers });
    } catch (dbError) {
      console.error('Erreur de connexion à la base de données:', dbError);
      // Retourner une liste vide en cas d'erreur de connexion
      return NextResponse.json({ 
        users: [],
        warning: 'Connexion à la base de données temporairement indisponible'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
} 