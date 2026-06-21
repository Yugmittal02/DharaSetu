import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Operator from '@/lib/models/Operator';
import Farmer from '@/lib/models/Farmer';
import WalletTransaction from '@/lib/models/WalletTransaction';
import Commission from '@/lib/models/Commission';
import ActivityLog from '@/lib/models/ActivityLog';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOperators,
      activeOperators,
      suspendedOperators,
      totalFarmers,
      todayFarmers,
      pendingFarmers,
      walletAgg,
      creditAgg,
      debitAgg,
      revenueAgg,
      commissionAgg,
      duplicateAttempts,
    ] = await Promise.all([
      Operator.countDocuments(),
      Operator.countDocuments({ status: 'active' }),
      Operator.countDocuments({ status: 'suspended' }),
      Farmer.countDocuments(),
      Farmer.countDocuments({ createdAt: { $gte: today } }),
      Farmer.countDocuments({ status: 'pending' }),
      Operator.aggregate([{ $group: { _id: null, total: { $sum: '$walletBalance' } } }]),
      WalletTransaction.aggregate([{ $match: { type: 'credit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      WalletTransaction.aggregate([{ $match: { type: 'debit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Farmer.aggregate([{ $group: { _id: null, total: { $sum: '$packageAmount' } } }]),
      Commission.aggregate([{ $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
      ActivityLog.countDocuments({ action: 'duplicate_attempt' }),
    ]);

    return NextResponse.json({
      totalOperators,
      activeOperators,
      suspendedOperators,
      totalFarmers,
      todayFarmers,
      pendingFarmers,
      totalWalletBalance: walletAgg[0]?.total || 0,
      totalCredits: creditAgg[0]?.total || 0,
      totalDebits: debitAgg[0]?.total || 0,
      totalRevenue: revenueAgg[0]?.total || 0,
      totalCommission: commissionAgg[0]?.total || 0,
      duplicateAttempts,
    });
  } catch (error: unknown) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
