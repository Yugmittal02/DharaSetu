import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Farmer from '@/lib/models/Farmer';
import WalletTransaction from '@/lib/models/WalletTransaction';
import Commission from '@/lib/models/Commission';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const user = authenticateRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'farmers';
    const operatorId = searchParams.get('operatorId') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const limit = 5000;

    let data: Record<string, unknown>[] = [];
    let filename = 'export';

    if (type === 'farmers') {
      const query: Record<string, unknown> = {};
      if (user.role === 'operator') {
        query.addedByOperatorId = user.operatorId;
        filename = 'my_farmers';
      } else {
        filename = 'all_farmers';
        if (operatorId) query.addedByOperatorId = operatorId;
      }
      if (status) query.status = status;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) (query.createdAt as Record<string, Date>).$gte = new Date(dateFrom);
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          (query.createdAt as Record<string, Date>).$lte = to;
        }
      }

      const farmers = await Farmer.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      data = farmers.map(f => ({
        'Farmer ID': f.farmerId,
        'Farmer Name': f.farmerName,
        'Father/Husband Name': f.fatherOrHusbandName,
        'Mobile': f.mobile,
        'Village': f.village,
        'Gram Panchayat': f.gramPanchayat,
        'Block': f.block,
        'District': f.district,
        'State': f.state,
        'PIN Code': f.pincode,
        'Farmer Type': f.farmerType,
        'Land Size': f.landSize,
        'Land Unit': f.landUnit,
        'Crop Name': f.cropName,
        'Crop Season': f.cropSeason,
        'Aadhaar': f.aadhaarMasked || 'N/A',
        'Service Required': (f.serviceRequired || []).join(', '),
        'Selected Package': f.selectedPackageName,
        'Package Amount': f.packageAmount,
        'Operator ID': f.addedByOperatorId,
        'Operator Name': f.addedByOperatorName,
        'Status': f.status,
        'Admin Remarks': f.adminRemarks || '',
        'Created At': new Date(f.createdAt).toLocaleString('en-IN'),
      }));
    } else if (type === 'transactions') {
      const query: Record<string, unknown> = {};
      if (user.role === 'operator') {
        query.operatorId = user.operatorId;
        filename = 'my_transactions';
      } else {
        filename = 'all_transactions';
        if (operatorId) query.operatorId = operatorId;
      }

      const transactions = await WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      data = transactions.map(t => ({
        'Transaction ID': t.transactionId,
        'Operator ID': t.operatorId,
        'Operator Name': t.operatorName,
        'Type': t.type,
        'Amount': t.amount,
        'Balance Before': t.balanceBefore,
        'Balance After': t.balanceAfter,
        'Package': t.selectedPackageName || '',
        'Farmer ID': t.relatedFarmerId || '',
        'Reason': t.reason,
        'Payment Mode': t.paymentMode || '',
        'Reference': t.referenceNumber || '',
        'Remarks': t.remarks || '',
        'Created At': new Date(t.createdAt).toLocaleString('en-IN'),
      }));
    } else if (type === 'commissions') {
      const query: Record<string, unknown> = {};
      if (user.role === 'operator') {
        query.operatorId = user.operatorId;
        filename = 'my_commissions';
      } else {
        filename = 'all_commissions';
        if (operatorId) query.operatorId = operatorId;
      }

      const commissions = await Commission.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      data = commissions.map(c => ({
        'Commission ID': c.commissionId,
        'Operator ID': c.operatorId,
        'Operator Name': c.operatorName,
        'Farmer ID': c.farmerId,
        'Package': c.selectedPackageName,
        'Package Amount': c.packageAmount,
        'Commission Amount': c.commissionAmount,
        'Status': c.status,
        'Created At': new Date(c.createdAt).toLocaleString('en-IN'),
      }));
    }

    // Generate XLSX
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
