export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await dbConnect();
    const result = await User.deleteMany({ role: 'operator' });
    const allUsers = await User.find({}).lean();
    return NextResponse.json({ success: true, deleted: result.deletedCount, allUsers });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
