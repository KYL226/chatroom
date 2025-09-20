import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Room, { IRoom } from '@/models/Room';
import { verifyToken } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken'; // Assurez-vous d'importer le type JwtPayload si nécessaire

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token) as JwtPayload | null; // Cast explicite pour préciser le type de decoded
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { id: roomId } = await params;

    const room = await Room.findById(roomId)
      .populate('members', 'name email avatar role isOnline')
      .populate('createdBy', 'name email')
      .lean<IRoom>();

    if (!room) {
      return NextResponse.json({ error: 'Room non trouvée' }, { status: 404 });
    }

    if (
      !room.isPublic &&
      !room.members.some((member) => member._id.toString() === decoded.userId)
    ) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Erreur lors de la récupération de la room:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
