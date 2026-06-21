import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Settings from '@/lib/models/Settings';
import Counter from '@/lib/models/Counter';
import { hashPassword } from '@/lib/auth';

// GET /api/auth/seed - Create default admin and settings
export async function GET() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'System already seeded', alreadySeeded: true });
    }

    // Create super admin with custom credentials
    const passwordHash = await hashPassword('Yug2004');
    await User.create({
      name: 'Yug Mittal',
      mobile: '8619152422',
      email: 'admin@dharasetu.in',
      passwordHash,
      role: 'super_admin',
      status: 'active',
    });

    // Create default settings
    await Settings.findByIdAndUpdate(
      'global_settings',
      {
        servicePackages: {
          package149: {
            name: 'Farmer Basic Registration',
            price: 149,
            commission: 50,
            companyShare: 99,
            description: 'Basic farmer profile with crop and land details',
            features: ['Basic farmer profile', 'Crop and land details', 'Service interest record', 'Farmer acknowledgement ID'],
          },
          package249: {
            name: 'Farmer Complete Documentation',
            price: 249,
            commission: 100,
            companyShare: 149,
            description: 'Complete documentation with bank/FPO/warehouse details',
            features: ['Complete farmer profile', 'Crop, land and batai/tenant details', 'Bank/FPO/warehouse interest details', 'Documentation readiness details', 'Farmer acknowledgement ID'],
          },
        },
        minimumWalletWarning: 300,
        supportContact: '+91 8619152422',
        exportLimit: 5000,
        maintenanceMode: false,
      },
      { upsert: true, new: true }
    );

    // Initialize counters
    await Counter.findByIdAndUpdate('operator', { prefix: 'DSC-BHR-', currentSequence: 0 }, { upsert: true });
    await Counter.findByIdAndUpdate('farmer', { prefix: 'DSF-BHR-', currentSequence: 0 }, { upsert: true });
    await Counter.findByIdAndUpdate('transaction', { prefix: 'TXN-', currentSequence: 0 }, { upsert: true });
    await Counter.findByIdAndUpdate('commission', { prefix: 'COM-', currentSequence: 0 }, { upsert: true });

    return NextResponse.json({ 
      message: 'System seeded successfully',
      admin: { mobile: '8619152422', password: 'Yug2004' }
    });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
  }
}
