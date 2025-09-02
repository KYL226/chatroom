import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Message from '@/models/Message';
import Room from '@/models/Room';
import Report from '@/models/Report';
import Statistics from '@/models/Statistics';
import { verifyToken } from '@/lib/auth';

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

    // Vérifier que l'utilisateur est admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, all

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // Depuis le début
    }

    // Statistiques générales
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isOnline: true });
    const totalMessages = await Message.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Statistiques pour la période
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const newMessages = await Message.countDocuments({ createdAt: { $gte: startDate } });
    const newRooms = await Room.countDocuments({ createdAt: { $gte: startDate } });
    const newReports = await Report.countDocuments({ createdAt: { $gte: startDate } });

    // Activité par heure (pour les dernières 24h)
    const hourlyActivity = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top salles par activité
    const topRooms = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversation',
          foreignField: '_id',
          as: 'conversation'
        }
      },
      {
        $unwind: '$conversation'
      },
      {
        $group: {
          _id: '$conversation.room',
          messageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: '_id',
          foreignField: '_id',
          as: 'room'
        }
      },
      {
        $unwind: '$room'
      },
      {
        $project: {
          roomName: '$room.name',
          messageCount: 1
        }
      },
      {
        $sort: { messageCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Utilisateurs les plus actifs
    const topUsers = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$sender',
          messageCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userName: '$user.name',
          messageCount: 1
        }
      },
      {
        $sort: { messageCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Statistiques des signalements
    const reportStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Créer ou mettre à jour les statistiques du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await Statistics.findOneAndUpdate(
      { date: today },
      {
        totalUsers,
        activeUsers,
        totalMessages,
        totalRooms,
        totalReports,
        pendingReports,
        newUsers,
        newMessages,
        newRooms,
        userActivity: Object.fromEntries(
          hourlyActivity.map(item => [item._id, item.count])
        )
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalMessages,
          totalRooms,
          totalReports,
          pendingReports
        },
        period: {
          newUsers,
          newMessages,
          newRooms,
          newReports
        },
        activity: {
          hourly: hourlyActivity,
          topRooms,
          topUsers
        },
        reports: reportStats
      }
    });

  } catch (error) {
    console.error('Statistics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 