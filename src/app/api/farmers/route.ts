import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Farmer from '@/lib/models/Farmer';
import Operator from '@/lib/models/Operator';
import WalletTransaction from '@/lib/models/WalletTransaction';
import Commission from '@/lib/models/Commission';
import ActivityLog from '@/lib/models/ActivityLog';
import Settings from '@/lib/models/Settings';
import { getNextSequence } from '@/lib/models/Counter';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/farmers - List farmers
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';
    const operatorId = searchParams.get('operatorId') || '';
    const status = searchParams.get('status') || '';
    const village = searchParams.get('village') || '';
    const block = searchParams.get('block') || '';
    const district = searchParams.get('district') || '';
    const farmerType = searchParams.get('farmerType') || '';
    const packageId = searchParams.get('packageId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Operators can only see their own farmers
    if (user.role === 'operator') {
      query.addedByOperatorId = user.operatorId;
    } else if (operatorId) {
      query.addedByOperatorId = operatorId;
    }

    if (search) {
      query.$or = [
        { farmerId: { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (village) query.village = { $regex: village, $options: 'i' };
    if (block) query.block = { $regex: block, $options: 'i' };
    if (district) query.district = { $regex: district, $options: 'i' };
    if (farmerType) query.farmerType = farmerType;
    if (packageId) query.selectedPackageId = packageId;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) (query.createdAt as Record<string, Date>).$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        (query.createdAt as Record<string, Date>).$lte = to;
      }
    }

    const [farmers, total] = await Promise.all([
      Farmer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Farmer.countDocuments(query),
    ]);

    return NextResponse.json({
      farmers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    console.error('Get farmers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/farmers - Submit farmer (operator only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!authorizeRoles(user, 'operator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { idempotencyKey } = body;

    // Check idempotency - prevent double submission
    if (idempotencyKey) {
      const existingFarmer = await Farmer.findOne({ idempotencyKey });
      if (existingFarmer) {
        return NextResponse.json({ 
          farmer: existingFarmer, 
          message: 'Farmer already submitted',
          duplicate: true 
        });
      }
    }

    // Validate operator status
    const operator = await Operator.findOne({ operatorId: user!.operatorId });
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }
    if (operator.status !== 'active') {
      return NextResponse.json({ 
        error: 'Your DharaSetu Center account is suspended. Please contact Admin.' 
      }, { status: 403 });
    }

    // Get settings for package pricing
    const settings = await Settings.findById('global_settings');
    const packageKey = body.selectedPackageId as 'package149' | 'package249';
    const packageConfig = settings?.servicePackages?.[packageKey];
    
    if (!packageConfig) {
      return NextResponse.json({ error: 'Invalid package selected' }, { status: 400 });
    }

    const packageAmount = packageConfig.price;
    const commissionAmount = operator.commissionConfig?.[packageKey] || packageConfig.commission;
    const companyShare = packageAmount - commissionAmount;

    // Check wallet balance
    if (operator.walletBalance < packageAmount) {
      return NextResponse.json({ 
        error: 'Insufficient funds. Please recharge your DharaSetu Center wallet.',
        walletBalance: operator.walletBalance,
        required: packageAmount,
      }, { status: 400 });
    }

    // Check for duplicate farmer
    const duplicateChecks = [];
    
    // Check by mobile number
    if (body.mobile) {
      duplicateChecks.push(Farmer.findOne({ mobile: body.mobile }));
    }
    
    // Check by name + father/husband name + village
    if (body.farmerName && body.fatherOrHusbandName && body.village) {
      duplicateChecks.push(Farmer.findOne({
        farmerName: { $regex: `^${body.farmerName}$`, $options: 'i' },
        fatherOrHusbandName: { $regex: `^${body.fatherOrHusbandName}$`, $options: 'i' },
        village: { $regex: `^${body.village}$`, $options: 'i' },
      }));
    }

    const duplicateResults = await Promise.all(duplicateChecks);
    const duplicateFound = duplicateResults.find(r => r !== null);

    if (duplicateFound) {
      // Log duplicate attempt
      await ActivityLog.create({
        logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
        userId: user!.userId,
        operatorId: user!.operatorId,
        role: 'operator',
        action: 'duplicate_attempt',
        description: `Duplicate farmer attempt: ${body.farmerName}, mobile: ${body.mobile}. Existing farmer: ${duplicateFound.farmerId}`,
        relatedFarmerId: duplicateFound.farmerId,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        deviceInfo: req.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json({ 
        error: 'This farmer may already be registered. Please contact Admin.',
        duplicateFarmerId: duplicateFound.farmerId,
      }, { status: 409 });
    }

    // Generate unique Farmer ID
    const farmerId = await getNextSequence('farmer', 'DSF-BHR-', 6);

    // Get operator farmer serial
    const operatorFarmerCount = await Farmer.countDocuments({ addedByOperatorId: user!.operatorId });
    const operatorFarmerSerial = operatorFarmerCount + 1;

    // Mask Aadhaar if provided
    let aadhaarMasked = '';
    if (body.aadhaar) {
      const last4 = body.aadhaar.slice(-4);
      aadhaarMasked = `XXXX-XXXX-${last4}`;
      body.aadhaarLast4 = last4;
    }

    // Mask PAN if provided
    let panMasked = '';
    if (body.pan) {
      panMasked = body.pan.slice(0, 2) + 'XXXXX' + body.pan.slice(-2);
    }

    // Create farmer record
    const farmer = await Farmer.create({
      farmerId,
      farmerName: body.farmerName,
      fatherOrHusbandName: body.fatherOrHusbandName,
      mobile: body.mobile,
      alternateMobile: body.alternateMobile,
      gender: body.gender,
      age: body.age,
      address: body.address,
      village: body.village,
      gramPanchayat: body.gramPanchayat,
      block: body.block,
      tehsil: body.tehsil,
      district: body.district,
      state: body.state,
      pincode: body.pincode,
      aadhaarMasked,
      aadhaarLast4: body.aadhaarLast4,
      panMasked,
      pan: body.pan,
      janAadhaar: body.janAadhaar,
      bankAvailable: body.bankAvailable || 'No',
      farmerType: body.farmerType,
      landSize: body.landSize,
      landUnit: body.landUnit,
      cropName: body.cropName,
      cropSeason: body.cropSeason,
      expectedQuantity: body.expectedQuantity,
      irrigationSource: body.irrigationSource,
      landLocation: body.landLocation,
      landownerName: body.landownerName,
      landownerMobile: body.landownerMobile,
      consentAvailable: body.consentAvailable,
      fpoMember: body.fpoMember,
      warehouseInterest: body.warehouseInterest,
      bankLoanInterest: body.bankLoanInterest,
      kccAvailable: body.kccAvailable,
      currentRequirement: body.currentRequirement,
      serviceRequired: body.serviceRequired || [],
      selectedPackageId: packageKey,
      selectedPackageName: packageConfig.name,
      packageAmount,
      operatorCommission: commissionAmount,
      companyShare,
      addedByOperatorId: user!.operatorId!,
      addedByOperatorName: operator.operatorName,
      operatorFarmerSerial,
      status: 'pending',
      consentAccepted: body.consentAccepted,
      idempotencyKey: idempotencyKey || uuidv4(),
    });

    // Deduct wallet balance
    const balanceBefore = operator.walletBalance;
    const balanceAfter = balanceBefore - packageAmount;

    await Operator.findOneAndUpdate(
      { operatorId: user!.operatorId, walletBalance: { $gte: packageAmount } },
      { $inc: { walletBalance: -packageAmount } }
    );

    // Create wallet debit transaction
    const transactionId = await getNextSequence('transaction', 'TXN-', 8);
    await WalletTransaction.create({
      transactionId,
      operatorId: user!.operatorId!,
      operatorName: operator.operatorName,
      type: 'debit',
      amount: packageAmount,
      balanceBefore,
      balanceAfter,
      selectedPackageId: packageKey,
      selectedPackageName: packageConfig.name,
      relatedFarmerId: farmerId,
      reason: 'farmer_onboarding',
      createdBy: user!.userId,
    });

    // Create commission record
    const commissionId = await getNextSequence('commission', 'COM-', 8);
    await Commission.create({
      commissionId,
      operatorId: user!.operatorId!,
      operatorName: operator.operatorName,
      farmerId,
      selectedPackageName: packageConfig.name,
      packageAmount,
      commissionAmount,
      status: 'pending',
    });

    // Create activity log
    await ActivityLog.create({
      logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: user!.userId,
      operatorId: user!.operatorId,
      role: 'operator',
      action: 'farmer_submitted',
      description: `Farmer ${body.farmerName} submitted with ID ${farmerId}. Package: ${packageConfig.name} (₹${packageAmount})`,
      relatedFarmerId: farmerId,
      relatedTransactionId: transactionId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      deviceInfo: req.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      farmer: {
        farmerId: farmer.farmerId,
        farmerName: farmer.farmerName,
        selectedPackageName: farmer.selectedPackageName,
        packageAmount: farmer.packageAmount,
      },
      walletBalance: balanceAfter,
      transactionId,
      commissionId,
      message: 'Farmer successfully onboarded',
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Submit farmer error:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Duplicate submission detected' }, { status: 409 });
    }
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error),
      fullError: error
    }, { status: 500 });
  }
}
