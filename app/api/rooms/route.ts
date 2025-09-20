import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Room, { IRoom } from '@/models/Room';
import { verifyToken } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken'; // Pour typer le token décodé

export const runtime = 'nodejs';

interface Member {
  _id: {
    toString(): string;
  };
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token) as JwtPayload | null;
    if (!decoded || typeof decoded.userId !== 'string') {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer toutes les rooms publiques
    const rooms = await Room.find({ isPublic: true })
      .populate('members', 'name email avatar role isOnline')
      .sort({ createdAt: -1 })
      .lean<IRoom[]>();

    // Ajouter l'information sur si l'utilisateur est membre de chaque room
    const roomsWithMembership = rooms.map((room) => ({
      ...room,
      memberCount: room.members.length,
      isMember: room.members.some(
        (member: Member) => member._id.toString() === decoded.userId
      ),
    }));

    return NextResponse.json({ rooms: roomsWithMembership });
  } catch (error) {
    console.error('Erreur lors de la récupération des rooms:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token) as JwtPayload | null;
    if (!decoded || typeof decoded.userId !== 'string') {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { name, description, isPublic = true } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nom de la room requis' },
        { status: 400 }
      );
    }

    // Créer la room
    const room = new Room({
      name: name.trim(),
      description: description?.trim() || '',
      isPublic,
      createdBy: decoded.userId,
      members: [decoded.userId], // Le créateur est automatiquement membre
    });

    await room.save();

    // Récupérer la room avec les données populées
    const populatedRoom = await Room.findById(room._id).populate(
      'members',
      'name email avatar role isOnline'
    );

    return NextResponse.json({ room: populatedRoom }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la room:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
