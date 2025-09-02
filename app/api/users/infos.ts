import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ users: [] });
    }
    await connectDB();
    const users = await User.find({ _id: { $in: ids } }).select('name email');
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
