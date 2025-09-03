import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'users', 'rooms', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters long' }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const searchRegex = new RegExp(query, 'i');
    const results: { 
      users?: Array<{ _id: string; name: string; email: string; avatar?: string; role: string }>; 
      rooms?: Array<{ _id: string; name: string; description?: string; members: string[] }>; 
      messages?: Array<{ _id: string; content: string; sender: string; createdAt: Date }> 
    } = {};

    if (type === 'users' || type === 'all') {
      const users = await User.find({
        $and: [
          { _id: { $ne: decoded.userId } }, // Exclure l'utilisateur actuel
          { isBanned: { $ne: true } }, // Exclure les utilisateurs bannis
          {
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { bio: searchRegex }
            ]
          }
        ]
      })
      .select('name email avatar bio isOnline lastSeen role')
      .limit(limit)
      .lean();

      results.users = users.map((user: { _id: unknown; name?: string; email?: string; avatar?: string; role?: string }) => ({
        _id: String(user._id),
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar,
        role: user.role || 'user'
      }));
    }

    if (type === 'rooms' || type === 'all') {
      const rooms = await Room.find({
        name: searchRegex
      })
      .populate('members', 'name avatar')
      .select('name description members createdAt')
      .limit(limit)
      .lean();

      results.rooms = rooms.map((room: { _id: unknown; name?: string; description?: string; members?: string[] }) => ({
        _id: String(room._id),
        name: room.name || '',
        description: room.description,
        members: room.members || []
      }));
    }

    return NextResponse.json({
      success: true,
      data: results,
      query,
      type
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 