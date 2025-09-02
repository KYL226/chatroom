import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  members: Types.ObjectId[];
  isGroup: boolean;
  name?: string;
  createdBy: Types.ObjectId;
  lastMessage?: {
    content: string;
    sender: Types.ObjectId;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  isGroup: { type: Boolean, default: false },
  name: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: {
    content: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour updatedAt automatiquement
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
