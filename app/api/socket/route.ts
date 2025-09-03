import { NextResponse } from 'next/server';

// Cette route est utilisée pour initialiser Socket.io
// La logique Socket.io est gérée dans lib/socket.ts
export async function GET() {
  return NextResponse.json({ message: 'Socket.io endpoint' });
}

export async function POST() {
  return NextResponse.json({ message: 'Socket.io endpoint' });
}
