import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessageAttachment {
  _id: Types.ObjectId | string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface IMessage extends Document {
  conversation?: Types.ObjectId;
  room?: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  attachments?: IMessageAttachment[];
  createdAt: Date;
  read: boolean;
}

const AttachmentSchema = new Schema<IMessageAttachment>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number },
}, { _id: true });

const MessageSchema: Schema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: { type: [AttachmentSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
