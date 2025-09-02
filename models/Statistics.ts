import mongoose, { Schema, Document } from 'mongoose';

export interface IStatistics extends Document {
  date: Date;
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalRooms: number;
  totalReports: number;
  pendingReports: number;
  newUsers: number;
  newMessages: number;
  newRooms: number;
  userActivity: {
    [hour: number]: number;
  };
  roomActivity: {
    [roomId: string]: {
      messages: number;
      users: number;
    };
  };
}

const StatisticsSchema: Schema = new Schema({
  date: { type: Date, required: true, unique: true },
  totalUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  totalRooms: { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  pendingReports: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  newMessages: { type: Number, default: 0 },
  newRooms: { type: Number, default: 0 },
  userActivity: {
    type: Map,
    of: Number,
    default: {}
  },
  roomActivity: {
    type: Map,
    of: {
      messages: { type: Number, default: 0 },
      users: { type: Number, default: 0 }
    },
    default: {}
  }
});

// Index pour les requêtes de statistiques
StatisticsSchema.index({ date: -1 });
// StatisticsSchema.index({ date: 1 });

export default mongoose.models.Statistics || mongoose.model<IStatistics>('Statistics', StatisticsSchema); 