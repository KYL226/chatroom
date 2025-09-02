import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReport extends Document {
  reporter: Types.ObjectId;
  reportedUser?: Types.ObjectId;
  reportedMessage?: Types.ObjectId;
  reportedRoom?: Types.ObjectId;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderator?: Types.ObjectId;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  reportedMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  reportedRoom: { type: Schema.Types.ObjectId, ref: 'Room' },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  moderator: { type: Schema.Types.ObjectId, ref: 'User' },
  moderatorNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index pour améliorer les performances de recherche
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reporter: 1 });
ReportSchema.index({ reportedUser: 1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema); 