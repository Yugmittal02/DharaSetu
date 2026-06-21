import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Operator from '@/lib/models/Operator';
import User from '@/lib/models/User';
import ActivityLog from '@/lib/models/ActivityLog';
import { getNextSequence } from '@/lib/models/Counter';
import { authenticateRequest, authorizeRoles, hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/operators - List all operators
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { operatorId: { $regex: search, $options: 'i' } },
        { operatorName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { shopName: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const [operators, total] = await Promise.all([
      Operator.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Operator.countDocuments(query),
    ]);

    return NextResponse.json({
      operators,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    console.error('Get operators error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/operators - Create new operator
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'super_admin', 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Check duplicate mobile
    const existingOperator = await Operator.findOne({ mobile: body.mobile });
    if (existingOperator) {
      return NextResponse.json({ error: 'Mobile number already registered' }, { status: 400 });
    }

    // Generate unique operator ID
    const operatorId = await getNextSequence('operator', 'DSC-BHR-', 4);

    // Create operator record
    const operator = await Operator.create({
      operatorId,
      operatorName: body.operatorName,
      mobile: body.mobile,
      alternateMobile: body.alternateMobile,
      shopName: body.shopName,
      cscId: body.cscId,
      village: body.village,
      gramPanchayat: body.gramPanchayat,
      block: body.block,
      tehsil: body.tehsil,
      district: body.district,
      state: body.state,
      address: body.address,
      aadhaarLast4: body.aadhaarLast4,
      pan: body.pan,
      bankAccountHolder: body.bankAccountHolder,
      bankName: body.bankName,
      accountNumber: body.accountNumber,
      ifsc: body.ifsc,
      walletBalance: 0,
      commissionConfig: {
        package149: body.commission149 || 50,
        package249: body.commission249 || 100,
      },
      status: body.status || 'active',
      notes: body.notes,
      createdBy: user!.userId,
    });

    // NOTE: No User account created here - operator will set their own PIN on first center login

    // Create activity log
    await ActivityLog.create({
      logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: user!.userId,
      role: user!.role,
      action: 'operator_created',
      description: `Operator ${body.operatorName} created with ID ${operatorId}`,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      deviceInfo: req.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({ operator, operatorId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create operator error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
