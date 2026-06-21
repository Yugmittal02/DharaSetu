import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Operator from '@/lib/models/Operator';
import Farmer from '@/lib/models/Farmer';
import WalletTransaction from '@/lib/models/WalletTransaction';
import Commission from '@/lib/models/Commission';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';

// GET /api/market - Market view for admin
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const operators = await Operator.find().sort({ createdAt: -1 }).lean();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const operatorCards = await Promise.all(
      operators.map(async (op) => {
        const [totalFarmers, todayFarmers, pkg149, pkg249, revenue, commission] = await Promise.all([
          Farmer.countDocuments({ addedByOperatorId: op.operatorId }),
          Farmer.countDocuments({ addedByOperatorId: op.operatorId, createdAt: { $gte: today } }),
          Farmer.countDocuments({ addedByOperatorId: op.operatorId, selectedPackageId: 'package149' }),
          Farmer.countDocuments({ addedByOperatorId: op.operatorId, selectedPackageId: 'package249' }),
          Farmer.aggregate([
            { $match: { addedByOperatorId: op.operatorId } },
            { $group: { _id: null, total: { $sum: '$packageAmount' } } },
          ]),
          Commission.aggregate([
            { $match: { operatorId: op.operatorId } },
            { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
          ]),
        ]);

        return {
          operatorId: op.operatorId,
          operatorName: op.operatorName,
          shopName: op.shopName,
          mobile: op.mobile,
          village: op.village,
          block: op.block,
          district: op.district,
          status: op.status,
          walletBalance: op.walletBalance,
          totalFarmers,
          todayFarmers,
          package149Count: pkg149,
          package249Count: pkg249,
          totalRevenue: revenue[0]?.total || 0,
          totalCommission: commission[0]?.total || 0,
          lastLoginAt: op.lastLoginAt,
          lastAppOpenAt: op.lastAppOpenAt,
          appOpenCount: op.appOpenCount,
        };
      })
    );

    return NextResponse.json({ operators: operatorCards });
  } catch (error: unknown) {
    console.error('Market view error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
