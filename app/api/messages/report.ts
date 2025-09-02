import { NextResponse } from 'next/server';
import Message from '@/models/Message';
import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }
    const { messageId, reason } = await req.json();
    if (!messageId || !reason) return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
    await connectDB();
    // Ici, tu pourrais stocker le signalement dans une collection dédiée
    // Pour l'exemple, on ajoute juste un champ "reported" au message
    await Message.findByIdAndUpdate(messageId, { $set: { reported: true, reportReason: reason } });
    return NextResponse.json({ message: 'Signalement enregistré.' });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
