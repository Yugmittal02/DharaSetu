import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Farmer from '@/lib/models/Farmer';
import ActivityLog from '@/lib/models/ActivityLog';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/farmers/[farmerId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ farmerId: string }> }
) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { farmerId } = await params;
    const farmer = await Farmer.findOne({ farmerId }).lean();
    if (!farmer) return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });

    if (user.role === 'operator' && farmer.addedByOperatorId !== user.operatorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ farmer });
  } catch (error: unknown) {
    console.error('Get farmer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/farmers/[farmerId] - Update farmer status (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ farmerId: string }> }
) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { farmerId } = await params;
    const body = await req.json();

    const farmer = await Farmer.findOneAndUpdate(
      { farmerId },
      { 
        $set: { 
          status: body.status, 
          adminRemarks: body.adminRemarks || '' 
        } 
      },
      { new: true }
    );

    if (!farmer) return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });

    await ActivityLog.create({
      logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: user!.userId,
      role: user!.role,
      action: 'farmer_status_changed',
      description: `Farmer ${farmerId} status changed to ${body.status}. Remarks: ${body.adminRemarks || 'None'}`,
      relatedFarmerId: farmerId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      deviceInfo: req.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({ farmer });
  } catch (error: unknown) {
    console.error('Update farmer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
