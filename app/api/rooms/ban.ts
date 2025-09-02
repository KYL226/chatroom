import { NextResponse } from 'next/server';
import Room from '@/models/Room';
import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }
    const { roomId, userId } = await req.json();
    if (!roomId || !userId) return NextResponse.json({ error: 'roomId et userId requis.' }, { status: 400 });
    await connectDB();
    const room = await Room.findById(roomId);
    if (!room) return NextResponse.json({ error: 'Salle non trouvée.' }, { status: 404 });
    // Seuls les admins ou modérateurs peuvent bannir
    if (!room.admins.includes(payload.userId) && !room.moderators.includes(payload.userId)) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
    }
    if (!room.banned.includes(userId)) {
      room.banned.push(userId);
      // Retirer le membre banni de la salle
      room.members = room.members.filter((id: string) => id !== userId);
      await room.save();
    }
    return NextResponse.json({ room });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
