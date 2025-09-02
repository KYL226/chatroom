// Fichier d'exemple pour le modèle utilisateur MongoDB
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  bio?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  isOnline: boolean;
  lastSeen: Date;
  blockedUsers: Types.ObjectId[];
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  avatar: { type: String },
  bio: { type: String },
  age: { type: Number },
  gender: { type: String },
  interests: [{ type: String }],
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  banExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
