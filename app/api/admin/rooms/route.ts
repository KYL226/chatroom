import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Vérifier que l'utilisateur est admin ou modérateur
    if (decoded.role !== 'admin' && decoded.role !== 'moderator') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer toutes les rooms (publiques et privées)
    const rooms = await Room.find({})
      .populate('members', 'name email avatar role isOnline')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Erreur lors de la récupération des rooms:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Vérifier que l'utilisateur est admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('id');

    if (!roomId) {
      return NextResponse.json({ error: 'ID de la room requis' }, { status: 400 });
    }

    const room = await Room.findByIdAndDelete(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Room supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la room:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
