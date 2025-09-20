import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
    }
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Aucun utilisateur trouvé.' }, { status: 404 });
    }
    // Générer un token de reset valable 1h
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    // Ici, tu devrais envoyer un email avec le lien de reset contenant le token
    // Exemple: `${process.env.NEXT_PUBLIC_BASE_URL}/(auth)/reset-password?token=${resetToken}`
    // Pour l'instant, on retourne juste le token pour test
    return NextResponse.json({ message: 'Email de réinitialisation envoyé (simulation)', resetToken });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
