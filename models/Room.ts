import mongoose, { Schema, Document, Types } from 'mongoose';


export interface IRoom extends Document {
  name: string;
  description?: string;
  isPublic: boolean;
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  moderators: Types.ObjectId[];
  banned: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
}


const RoomSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  isPublic: { type: Boolean, default: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  banned: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
