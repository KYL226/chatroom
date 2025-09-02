import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  interests: [{
    type: String,
    trim: true
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String
  },
  banExpiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
userSchema.index({ role: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ isBanned: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
