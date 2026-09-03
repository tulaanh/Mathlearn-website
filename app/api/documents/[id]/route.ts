import { NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/documents';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting: 100 req/min cho read
  const ip = getClientIp(request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 100 });
  if (!success) {
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  return NextResponse.json(document);
}
