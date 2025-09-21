export async function GET() {
  // This endpoint is used by Socket.IO for polling transport
  return new Response('Socket.IO endpoint', { status: 200 });
}

export async function POST() {
  // This endpoint is used by Socket.IO for polling transport
  return new Response('Socket.IO endpoint', { status: 200 });
}
