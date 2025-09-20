import { NextResponse } from 'next/server';
import Room from '@/models/Room';
import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

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
    const { roomId, userId, action } = await req.json();
    if (!roomId || !userId || !['promote', 'demote'].includes(action)) return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
    await connectDB();
    const room = await Room.findById(roomId);
    if (!room) return NextResponse.json({ error: 'Salle non trouvée.' }, { status: 404 });
    // Seuls les admins peuvent promouvoir/dégrader
    if (!room.admins.includes(payload.userId)) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
    }
    if (action === 'promote' && !room.moderators.includes(userId)) {
      room.moderators.push(userId);
      await room.save();
    }
    if (action === 'demote' && room.moderators.includes(userId)) {
      room.moderators = room.moderators.filter((id: string) => id !== userId);
      await room.save();
    }
    return NextResponse.json({ room });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
