import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
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

    // Mettre à jour le statut en ligne et la dernière activité
    await User.findByIdAndUpdate(decoded.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    return NextResponse.json({ message: 'Heartbeat mis à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du heartbeat:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
