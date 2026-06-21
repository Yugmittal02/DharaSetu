import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Operator from '@/lib/models/Operator';
import User from '@/lib/models/User';
import Farmer from '@/lib/models/Farmer';
import WalletTransaction from '@/lib/models/WalletTransaction';
import Commission from '@/lib/models/Commission';
import Settings from '@/lib/models/Settings';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'operator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const operatorId = user!.operatorId;
    const operator = await Operator.findOne({ operatorId }).lean();
    
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    if (operator.status === 'suspended') {
      return NextResponse.json({ 
        error: 'Your DharaSetu Center account is suspended. Please contact Admin.',
        suspended: true 
      }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalFarmers,
      todayFarmers,
      pendingFarmers,
      verifiedFarmers,
      rejectedFarmers,
      debitAgg,
      totalCommission,
      pendingCommission,
      paidCommission,
      settings,
      hasPin,
    ] = await Promise.all([
      Farmer.countDocuments({ addedByOperatorId: operatorId }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, createdAt: { $gte: today } }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, status: 'pending' }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, status: 'verified' }),
      Farmer.countDocuments({ addedByOperatorId: operatorId, status: 'rejected' }),
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
      Settings.findById('global_settings').lean(),
      User.exists({ operatorId, role: 'operator' }),
    ]);

    const minimumWalletWarning = settings?.minimumWalletWarning || 300;
    const lowBalance = operator.walletBalance < minimumWalletWarning;

    return NextResponse.json({
      operator: {
        operatorId: operator.operatorId,
        operatorName: operator.operatorName,
        shopName: operator.shopName,
        mobile: operator.mobile,
        walletBalance: operator.walletBalance,
        status: operator.status,
      },
      pinSet: !!hasPin,
      stats: {
        totalFarmers,
        todayFarmers,
        pendingFarmers,
        verifiedFarmers,
        rejectedFarmers,
        totalDeducted: debitAgg[0]?.total || 0,
        totalCommission: totalCommission[0]?.total || 0,
        pendingCommission: pendingCommission[0]?.total || 0,
        paidCommission: paidCommission[0]?.total || 0,
      },
      lowBalance,
      minimumWalletWarning,
      appNotice: settings?.appNotice,
    });
  } catch (error: unknown) {
    console.error('Center dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
