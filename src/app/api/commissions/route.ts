import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Commission from '@/lib/models/Commission';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const operatorId = searchParams.get('operatorId') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (user.role === 'operator') {
      query.operatorId = user.operatorId;
    } else if (operatorId) {
      query.operatorId = operatorId;
    }
    if (status) query.status = status;

    const [commissions, total] = await Promise.all([
      Commission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Commission.countDocuments(query),
    ]);

    return NextResponse.json({
      commissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    console.error('Commissions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
