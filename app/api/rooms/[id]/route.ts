import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room, { IRoom } from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const roomId = params.id;

    const room = await Room.findById(roomId)
      .populate('members', 'name email avatar role isOnline')
      .populate('createdBy', 'name email')
      .lean<IRoom>();

    if (!room) {
      return NextResponse.json({ error: 'Room non trouvée' }, { status: 404 });
    }

    if (
      !room.isPublic &&
      !room.members.some((member: any) => member._id.toString() === decoded.userId)
    ) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Erreur lors de la récupération de la room:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
