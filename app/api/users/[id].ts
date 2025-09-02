import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

// GET: Récupérer le profil utilisateur
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// PATCH: Modifier le profil utilisateur
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }
    if (payload.userId !== params.id) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
    }
    const { avatar, bio, interests } = await req.json();
    await connectDB();
    const user = await User.findByIdAndUpdate(
      params.id,
      { avatar, bio, interests },
      { new: true, runValidators: true }
    ).select('-password');
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
