import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Operator from '@/lib/models/Operator';
import Farmer from '@/lib/models/Farmer';
import WalletTransaction from '@/lib/models/WalletTransaction';
import Commission from '@/lib/models/Commission';
import ActivityLog from '@/lib/models/ActivityLog';
import User from '@/lib/models/User';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/operators/[operatorId] - Get operator details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ operatorId: string }> }
) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operatorId } = await params;

    // Operators can only view their own data
    if (user.role === 'operator' && user.operatorId !== operatorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const operator = await Operator.findOne({ operatorId }).lean();
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalFarmers,
      todayFarmers,
      monthFarmers,
      package149Count,
      package249Count,
      verifiedFarmers,
      rejectedFarmers,
      pendingFarmers,
      totalCredits,
      totalDebits,
      totalCommission,
      pendingCommission,
      paidCommission,
    ] = await Promise.all([
      Farmer.countDocuments({ addedByOperatorId: operatorId }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, createdAt: { $gte: today } }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, createdAt: { $gte: monthStart } }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, selectedPackageId: 'package149' }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, selectedPackageId: 'package249' }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, status: 'verified' }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, status: 'rejected' }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, status: 'pending' }),
      WalletTransaction.aggregate([
        { $match: { operatorId, type: 'credit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      WalletTransaction.aggregate([
        { $match: { operatorId, type: 'debit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Commission.aggregate([
        { $match: { operatorId } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
      ]),
      Commission.aggregate([
        { $match: { operatorId, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
      ]),
      Commission.aggregate([
        { $match: { operatorId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
      ]),
    ]);

    const stats = {
      totalFarmers,
      todayFarmers,
      monthFarmers,
      package149Count,
      package249Count,
      verifiedFarmers,
      rejectedFarmers,
      pendingFarmers,
      totalCredits: totalCredits[0]?.total || 0,
      totalDebits: totalDebits[0]?.total || 0,
      totalCommission: totalCommission[0]?.total || 0,
      pendingCommission: pendingCommission[0]?.total || 0,
      paidCommission: paidCommission[0]?.total || 0,
    };

    return NextResponse.json({ operator, stats });
  } catch (error: unknown) {
    console.error('Get operator error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/operators/[operatorId] - Update operator
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ operatorId: string }> }
) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operatorId } = await params;
    const body = await req.json();
    
    // Handle suspension
    const operator = await Operator.findOne({ operatorId });
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    const oldStatus = operator.status;
    
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'operatorName', 'alternateMobile', 'shopName', 'cscId', 'village',
      'gramPanchayat', 'block', 'tehsil', 'district', 'state', 'address',
      'aadhaarLast4', 'pan', 'bankAccountHolder', 'bankName', 'accountNumber',
      'ifsc', 'status', 'notes',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.commission149 !== undefined || body.commission249 !== undefined) {
      updateData['commissionConfig'] = {
        package149: body.commission149 || operator.commissionConfig.package149,
        package249: body.commission249 || operator.commissionConfig.package249,
      };
    }

    const updatedOperator = await Operator.findOneAndUpdate(
      { operatorId },
      { $set: updateData },
      { new: true }
    );

    // Update user status if operator status changed
    if (body.status && body.status !== oldStatus) {
      await User.updateOne(
        { operatorId },
        { $set: { status: body.status } }
      );

      const action = body.status === 'suspended' ? 'operator_suspended' : 'operator_reactivated';
      await ActivityLog.create({
        logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
        userId: user!.userId,
        operatorId,
        role: user!.role,
        action,
        description: `Operator ${operatorId} ${action.replace('operator_', '')}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        deviceInfo: req.headers.get('user-agent') || 'unknown',
      });
    }

    return NextResponse.json({ operator: updatedOperator });
  } catch (error: unknown) {
    console.error('Update operator error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
