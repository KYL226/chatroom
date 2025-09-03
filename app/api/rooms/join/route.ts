import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: 'ID de la room requis' }, { status: 400 });
    }

    // Vérifier que la room existe et est publique
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room non trouvée' }, { status: 404 });
    }

    if (!room.isPublic) {
      return NextResponse.json({ error: 'Cette room est privée' }, { status: 403 });
    }

    // Vérifier si l'utilisateur est déjà membre
    if (room.members.includes(decoded.userId)) {
      return NextResponse.json({ error: 'Vous êtes déjà membre de cette room' }, { status: 400 });
    }

    // Ajouter l'utilisateur à la room
    room.members.push(decoded.userId);
    await room.save();

    return NextResponse.json({ message: 'Vous avez rejoint la room avec succès' });
  } catch (error) {
    console.error('Erreur lors de la jointure de la room:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
