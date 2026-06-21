import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ActivityLog from '@/lib/models/ActivityLog';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action') || '';
    const operatorId = searchParams.get('operatorId') || '';
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (action) query.action = action;
    if (operatorId) query.operatorId = operatorId;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ActivityLog.countDocuments(query),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    console.error('Logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
