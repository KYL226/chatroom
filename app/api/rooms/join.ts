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
    const { roomId } = await req.json();
    if (!roomId) return NextResponse.json({ error: 'roomId requis.' }, { status: 400 });
    await connectDB();
    const room = await Room.findById(roomId);
    if (!room) return NextResponse.json({ error: 'Salle non trouvée.' }, { status: 404 });
    if (!room.members.includes(payload.userId)) {
      room.members.push(payload.userId);
      await room.save();
    }
    return NextResponse.json({ room });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
