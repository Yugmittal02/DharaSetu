import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Operator from '@/lib/models/Operator';
import WalletTransaction from '@/lib/models/WalletTransaction';
import ActivityLog from '@/lib/models/ActivityLog';
import { getNextSequence } from '@/lib/models/Counter';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/wallet - Get wallet transactions
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const operatorId = searchParams.get('operatorId') || '';
    const type = searchParams.get('type') || '';
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (user.role === 'operator') {
      query.operatorId = user.operatorId;
    } else if (operatorId) {
      query.operatorId = operatorId;
    }
    if (type) query.type = type;

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      WalletTransaction.countDocuments(query),
    ]);

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    console.error('Get wallet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wallet - Add/deduct funds (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { operatorId, type, amount, paymentMode, referenceNumber, remarks } = body;

    if (!operatorId || !type || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const operator = await Operator.findOne({ operatorId });
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    const balanceBefore = operator.walletBalance;
    let balanceAfter: number;

    if (type === 'credit') {
      balanceAfter = balanceBefore + amount;
    } else if (type === 'debit') {
      if (balanceBefore < amount) {
        return NextResponse.json({ error: 'Insufficient balance for deduction' }, { status: 400 });
      }
      balanceAfter = balanceBefore - amount;
    } else {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    // Update wallet balance
    await Operator.findOneAndUpdate(
      { operatorId },
      { $set: { walletBalance: balanceAfter } }
    );

    // Create transaction
    const transactionId = await getNextSequence('transaction', 'TXN-', 8);
    const transaction = await WalletTransaction.create({
      transactionId,
      operatorId,
      operatorName: operator.operatorName,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      reason: type === 'credit' ? 'admin_credit' : 'admin_debit',
      paymentMode,
      referenceNumber,
      remarks,
      createdBy: user!.userId,
    });

    // Log activity
    await ActivityLog.create({
      logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: user!.userId,
      operatorId,
      role: user!.role,
      action: type === 'credit' ? 'wallet_credited' : 'wallet_debited',
      description: `₹${amount} ${type}ed to operator ${operatorId}. Balance: ₹${balanceBefore} → ₹${balanceAfter}`,
      relatedTransactionId: transactionId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      deviceInfo: req.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      transaction,
      walletBalance: balanceAfter,
      message: `₹${amount} ${type}ed successfully`,
    });
  } catch (error: unknown) {
    console.error('Wallet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
