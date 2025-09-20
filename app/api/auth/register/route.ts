import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe requis.' }, 
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères.' }, 
        { status: 400 }
      );
    }

    await connectDB();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà.' }, 
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Créer le nouvel utilisateur
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isOnline: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email, 
        role: newUser.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Inscription réussie',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        bio: newUser.bio
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur.' }, 
      { status: 500 }
    );
  }
} 