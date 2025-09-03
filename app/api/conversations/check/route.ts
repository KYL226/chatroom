import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import { verifyToken } from '@/lib/auth';

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

    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: 'ID du membre requis' }, { status: 400 });
    }

    // Vérifier si une conversation privée existe déjà entre ces deux utilisateurs
    const existingConversation = await Conversation.findOne({
      members: { $all: [decoded.userId, memberId] },
      isGroup: false
    }).populate('members', 'name email avatar role isOnline');

    if (existingConversation) {
      return NextResponse.json({ 
        exists: true, 
        conversation: existingConversation 
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Erreur lors de la vérification de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
