import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import User from '@/models/User';
import Message from '@/models/Message';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

// Mettre à jour le statut d'un signalement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const user = await User.findById(decoded.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { status, moderatorNotes, action } = body;

    const { id } = await params;
    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Mettre à jour le signalement
    report.status = status;
    report.moderator = decoded.userId;
    report.moderatorNotes = moderatorNotes;
    report.updatedAt = new Date();

    await report.save();

    // Appliquer les actions si nécessaire
    if (action && status === 'resolved') {
      await applyModerationAction(report, action, decoded.userId);
    }

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      report
    });

  } catch (error) {
    console.error('Report update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Supprimer un signalement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Vérifier que l'utilisateur est admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Report deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fonction pour appliquer les actions de modération
async function applyModerationAction(report: { type: string; reason: string; reportedUser?: string; reportedMessage?: string; reportedRoom?: string }, action: string, moderatorId: string) {
  try {
    switch (action) {
      case 'ban_user':
        if (report.reportedUser) {
          await User.findByIdAndUpdate(report.reportedUser, {
            isBanned: true,
            banReason: `Banned due to report: ${report.reason}`,
            banExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
            bannedBy: moderatorId,
            bannedAt: new Date()
          });
        }
        break;

      case 'delete_message':
        if (report.reportedMessage) {
          await Message.findByIdAndDelete(report.reportedMessage);
        }
        break;

      case 'delete_room':
        if (report.reportedRoom) {
          await Room.findByIdAndDelete(report.reportedRoom);
        }
        break;

      case 'warn_user':
        // Logique pour avertir l'utilisateur (peut être implémentée plus tard)
        break;

      default:
        console.log('Unknown moderation action:', action);
    }
  } catch (error) {
    console.error('Error applying moderation action:', error);
  }
} 