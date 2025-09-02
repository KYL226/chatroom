import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les conversations où l'utilisateur est membre
    const conversations = await Conversation.find({
      members: decoded.userId
    })
    .populate('members', 'name email avatar role isOnline')
    .populate('lastMessage.sender', 'name email avatar')
    .sort({ updatedAt: -1 })
    .lean();

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { memberIds, name } = await request.json();

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: 'IDs des membres requis' }, { status: 400 });
    }

    // Vérifier que tous les utilisateurs existent
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      return NextResponse.json({ error: 'Un ou plusieurs utilisateurs non trouvés' }, { status: 404 });
    }

    // Créer la conversation
    const conversation = new Conversation({
      name: name || null,
      members: [...memberIds, decoded.userId], // Inclure l'utilisateur actuel
      createdBy: decoded.userId
    });

    await conversation.save();

    // Récupérer la conversation avec les données populées
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('members', 'name email avatar role isOnline')
      .populate('lastMessage.sender', 'name email avatar');

    return NextResponse.json({ conversation: populatedConversation }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
