import { NextResponse } from 'next/server';
import Room from '@/models/Room';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    await connectDB();
    const rooms = await Room.find({ name: { $regex: q, $options: 'i' } });
    return NextResponse.json({ rooms });
  } catch {
    return NextResponse.json({ rooms: [] });
  }
}
