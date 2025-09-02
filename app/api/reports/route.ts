import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { verifyToken } from '@/lib/auth';

// Créer un nouveau signalement
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { reportedUser, reportedMessage, reportedRoom, reason, description } = body;

    if (!reason || !description) {
      return NextResponse.json({ error: 'Reason and description are required' }, { status: 400 });
    }

    // Vérifier qu'au moins un élément est signalé
    if (!reportedUser && !reportedMessage && !reportedRoom) {
      return NextResponse.json({ error: 'Must report a user, message, or room' }, { status: 400 });
    }

    const report = new Report({
      reporter: decoded.userId,
      reportedUser,
      reportedMessage,
      reportedRoom,
      reason,
      description,
      status: 'pending'
    });

    await report.save();

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
      report
    });

  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Obtenir la liste des signalements (pour admins/moderators)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou modérateur
    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.userId);
    
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('reportedMessage', 'content sender')
      .populate('reportedRoom', 'name')
      .populate('moderator', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments(filter);

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 