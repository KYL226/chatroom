import { NextResponse } from 'next/server';
import Message from '@/models/Message';
import { connectDB } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { MessageFilter } from '@/types/global';

const JWT_SECRET = process.env.JWT_SECRET || '';

// GET: Récupérer les messages d'une conversation ou d'une salle avec pagination
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const roomId = url.searchParams.get('roomId');
    const limitParam = parseInt(url.searchParams.get('limit') || '20', 10);
    const before = url.searchParams.get('before'); // ISO date string

    const limit = Math.min(Math.max(limitParam, 10), 50);

    await connectDB();

    const filter: MessageFilter = {};
    if (conversationId) filter.conversation = conversationId;
    if (roomId) filter.room = roomId;
    if (!conversationId && !roomId) {
      return NextResponse.json({ error: 'conversationId ou roomId requis.' }, { status: 400 });
    }

    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        filter.createdAt = { $lt: beforeDate };
      }
    }

    const docs = await Message.find(filter)
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // On renvoie du plus ancien au plus récent pour affichage naturel
    const messages = [...docs].reverse();

    const hasMore = docs.length === limit; // heuristique: s'il y a autant que limit, il y a probablement encore des anciens
    const nextCursor = messages.length > 0 ? messages[0].createdAt : null; // le plus ancien de ce lot

    return NextResponse.json({ messages, hasMore, nextCursor });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// POST: Envoyer un message
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
    const body = await req.json();
    const { conversationId, roomId, content } = body as { conversationId?: string; roomId?: string; content: string };
    const { attachments } = body as { attachments?: Array<{ url: string; type: string; name: string; size?: number }> };

    if (!conversationId && !roomId) {
      return NextResponse.json({ error: 'conversationId ou roomId requis.' }, { status: 400 });
    }

    await connectDB();
    
    // Vérifier que l'utilisateur est membre de la salle si c'est un message de salle
    if (roomId) {
      const Room = (await import('@/models/Room')).default;
      const room = await Room.findById(roomId);
      if (!room) {
        return NextResponse.json({ error: 'Salle non trouvée.' }, { status: 404 });
      }
      if (!room.members.map((m: string) => m.toString()).includes(payload.userId)) {
        return NextResponse.json({ error: 'Vous devez être membre de la salle pour envoyer un message.' }, { status: 403 });
      }
    }

    // Normaliser les pièces jointes si présentes
    const normalizedAttachments = (attachments || []).map((att: { originalName?: string; name: string; url: string; type: string; size?: number }) => ({
      name: att.originalName || att.name,
      url: att.url,
      type: att.type || 'application/octet-stream',
      size: att.size,
    }));

    const message = await Message.create({
      conversation: conversationId,
      room: roomId,
      sender: payload.userId,
      content: content || '',
      attachments: normalizedAttachments,
    });
    
    // Récupérer le message avec les données du sender populées
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar role')
      .lean();
    
    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
