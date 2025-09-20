import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || '';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    console.log("API /api/users/infos - Token reçu:", token ? "PRÉSENT" : "ABSENT");
    
    if (!token) {
      console.log("API /api/users/infos - Erreur: Token requis");
      return NextResponse.json({ error: 'Token requis.' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log("API /api/users/infos - Token décodé, userId:", payload.userId);
    } catch (error) {
      console.log("API /api/users/infos - Erreur décodage token:", error);
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }

    await connectDB();
    console.log("API /api/users/infos - Connexion DB établie");
    
    const user = await User.findById(payload.userId).select('-password');
    console.log("API /api/users/infos - Utilisateur trouvé:", user ? "OUI" : "NON");
    
    if (!user) {
      console.log("API /api/users/infos - Erreur: Utilisateur non trouvé");
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    const userData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        interests: user.interests,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    };
    
    console.log("API /api/users/infos - Réponse envoyée:", userData);
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Erreur lors de la récupération des infos utilisateur:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    console.log("API /api/users/infos PATCH - Token reçu:", token ? "PRÉSENT" : "ABSENT");
    
    if (!token) {
      console.log("API /api/users/infos PATCH - Erreur: Token requis");
      return NextResponse.json({ error: 'Token requis.' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log("API /api/users/infos PATCH - Token décodé, userId:", payload.userId);
    } catch (error) {
      console.log("API /api/users/infos PATCH - Erreur décodage token:", error);
      return NextResponse.json({ error: 'Token invalide.' }, { status: 401 });
    }

    const body = await req.json() as { name?: string; avatar?: string; bio?: string; interests?: string[] };
    console.log("API /api/users/infos PATCH - Données reçues:", body);

    await connectDB();
    
    const user = await User.findById(payload.userId);
    if (!user) {
      console.log("API /api/users/infos PATCH - Erreur: Utilisateur non trouvé");
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    // Mettre à jour les champs autorisés
    const updateData: { name?: string; avatar?: string; bio?: string; interests?: string[] } = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.interests !== undefined) updateData.interests = body.interests;

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log("API /api/users/infos PATCH - Erreur: Échec de la mise à jour");
      return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
    }

    console.log("API /api/users/infos PATCH - Utilisateur mis à jour avec succès");
    return NextResponse.json({ 
      message: 'Profil mis à jour avec succès',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        interests: updatedUser.interests,
        isOnline: updatedUser.isOnline,
        lastSeen: updatedUser.lastSeen
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
} 