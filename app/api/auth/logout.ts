import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Mettre à jour le statut en ligne lors de la déconnexion
    await User.findByIdAndUpdate(decoded.userId, {
      isOnline: false,
      lastSeen: new Date()
    });

    const response = NextResponse.json({ message: 'Déconnexion réussie' });
    
    // Supprimer le cookie de session si vous en utilisez un
    response.cookies.delete('session');
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
