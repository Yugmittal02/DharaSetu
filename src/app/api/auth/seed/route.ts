import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Settings from '@/lib/models/Settings';
import Counter from '@/lib/models/Counter';
import { hashPassword } from '@/lib/auth';

// GET /api/auth/seed - Create default admin and settings
// PROTECTED: Only works when ALLOW_SEED=true environment variable is set
export async function GET() {
  // Security gate — block in production unless explicitly allowed
  if (process.env.ALLOW_SEED !== 'true') {
    return NextResponse.json({ error: 'Seed endpoint is disabled. Set ALLOW_SEED=true in environment to enable.' }, { status: 403 });
  }

  try {
    await dbConnect();

    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'System already seeded', alreadySeeded: true });
    }

    const adminMobile = process.env.ADMIN_MOBILE || '8619152422';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Yug2004';
    const adminName = process.env.ADMIN_NAME || 'Yug Mittal';

    const passwordHash = await hashPassword(adminPassword);
    await User.create({
      name: adminName,
      mobile: adminMobile,
      email: 'admin@dharasetu.in',
      passwordHash,
      role: 'super_admin',
      status: 'active',
    });

    await Settings.findByIdAndUpdate('global_settings', {
      servicePackages: {
        package149: {
          name: 'Farmer Basic Registration',
          price: 149, commission: 50, companyShare: 99,
          description: 'Basic farmer profile with crop and land details',
          features: ['Basic farmer profile', 'Crop and land details', 'Service interest record', 'Farmer acknowledgement ID'],
        },
        package249: {
          name: 'Farmer Complete Documentation',
          price: 249, commission: 100, companyShare: 149,
          description: 'Complete documentation with bank/FPO/warehouse details',
          features: ['Complete farmer profile', 'Crop, land and batai/tenant details', 'Bank/FPO/warehouse interest details', 'Documentation readiness details', 'Farmer acknowledgement ID'],
        },
      },
      minimumWalletWarning: 300,
      supportContact: '+91 8619152422',
      exportLimit: 5000,
      maintenanceMode: false,
    }, { upsert: true, new: true });

    await Counter.findByIdAndUpdate('operator', { prefix: 'DSC-BHR-', currentSequence: 0 }, { upsert: true });
    await Counter.findByIdAndUpdate('farmer', { prefix: 'DSF-BHR-', currentSequence: 0 }, { upsert: true });
    await Counter.findByIdAndUpdate('transaction', { prefix: 'TXN-', currentSequence: 0 }, { upsert: true });
    await Counter.findByIdAndUpdate('commission', { prefix: 'COM-', currentSequence: 0 }, { upsert: true });

    // Don't expose credentials in response
    return NextResponse.json({ message: 'System seeded successfully. Use the configured admin credentials to login.' });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
