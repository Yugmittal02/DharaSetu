import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Operator from '@/lib/models/Operator';
import Settings from '@/lib/models/Settings';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';

// Simple in-memory rate limiter
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  record.count++;
  return record.count <= RATE_LIMIT_MAX;
}

// Cleanup stale entries every 15 min
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of loginAttempts) {
    if (now - rec.firstAttempt > RATE_LIMIT_WINDOW) loginAttempts.delete(ip);
  }
}, RATE_LIMIT_WINDOW);

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again after 15 minutes.' }, { status: 429 });
    }

    await dbConnect();
    const body = await req.json();
    const { mobile, password, operatorId, loginType, action, newPin } = body;

    if (loginType === 'admin') {
      // Admin login
      const user = await User.findOne({ mobile, role: { $in: ['super_admin', 'admin'] } });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      if (user.status !== 'active') {
        return NextResponse.json({ error: 'Account is suspended' }, { status: 403 });
      }
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
        name: user.name,
      });
      return NextResponse.json({ 
        token, 
        user: { 
          id: user._id, 
          name: user.name, 
          role: user.role,
          mobile: user.mobile 
        } 
      });

    } else {
      // Operator login flow
      const operator = await Operator.findOne({ operatorId: operatorId?.toUpperCase() });
      
      if (!operator) {
        return NextResponse.json({ error: 'Invalid DharaSetu Center ID' }, { status: 401 });
      }
      if (operator.mobile !== mobile) {
        return NextResponse.json({ error: 'Mobile number does not match this Center ID' }, { status: 401 });
      }
      if (operator.status === 'suspended') {
        return NextResponse.json({ 
          error: 'Your DharaSetu Center account is suspended. Please contact Admin.' 
        }, { status: 403 });
      }
      if (operator.status !== 'active') {
        return NextResponse.json({ error: 'Account is not active yet' }, { status: 403 });
      }

      // Check if user account exists (PIN already set)
      const existingUser = await User.findOne({ operatorId: operator.operatorId, role: 'operator' });

      // Action: setup_pin — first time PIN creation
      if (action === 'setup_pin') {
        if (existingUser) {
          return NextResponse.json({ error: 'PIN already set. Please login with your existing PIN.' }, { status: 400 });
        }
        if (!newPin || newPin.length < 4) {
          return NextResponse.json({ error: 'PIN must be at least 4 characters' }, { status: 400 });
        }

        const passwordHash = await hashPassword(newPin);
        await User.create({
          name: operator.operatorName,
          mobile: operator.mobile,
          passwordHash,
          role: 'operator',
          operatorId: operator.operatorId,
          status: 'active',
        });

        // Log activity
        const ActivityLog = (await import('@/lib/models/ActivityLog')).default;
        const { v4: uuidv4 } = await import('uuid');
        await ActivityLog.create({
          logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
          operatorId: operator.operatorId,
          role: 'operator',
          action: 'pin_setup',
          description: `Operator ${operator.operatorName} set their login PIN`,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          deviceInfo: req.headers.get('user-agent') || 'unknown',
        });

        // Auto-login after PIN setup
        const token = generateToken({
          userId: operator._id.toString(),
          role: 'operator',
          operatorId: operator.operatorId,
          name: operator.operatorName,
        });

        // Update login info
        await Operator.findOneAndUpdate(
          { operatorId: operator.operatorId },
          { $set: { lastLoginAt: new Date(), lastAppOpenAt: new Date() }, $inc: { appOpenCount: 1 } }
        );

        return NextResponse.json({ 
          token, 
          user: { 
            id: operator._id, 
            name: operator.operatorName, 
            role: 'operator',
            operatorId: operator.operatorId,
            mobile: operator.mobile,
            walletBalance: operator.walletBalance,
            shopName: operator.shopName,
          },
          message: 'PIN set successfully!'
        });
      }

      // Action: check — verify ID + mobile and check if PIN exists
      if (action === 'check') {
        if (!existingUser) {
          // First time login - auto login without PIN
          const token = generateToken({
            userId: operator._id.toString(), // Temporary user ID for first login
            role: 'operator',
            operatorId: operator.operatorId,
            name: operator.operatorName,
          });

          // Update login info
          await Operator.findOneAndUpdate(
            { operatorId: operator.operatorId },
            { $set: { lastLoginAt: new Date(), lastAppOpenAt: new Date() }, $inc: { appOpenCount: 1 } }
          );

          return NextResponse.json({ 
            valid: true,
            pinSet: false,
            operatorName: operator.operatorName,
            shopName: operator.shopName,
            token,
            user: { 
              id: operator._id, 
              name: operator.operatorName, 
              role: 'operator',
              operatorId: operator.operatorId,
              mobile: operator.mobile,
              walletBalance: operator.walletBalance,
              shopName: operator.shopName,
            }
          });
        }

        return NextResponse.json({ 
          valid: true,
          pinSet: true,
          operatorName: operator.operatorName,
          shopName: operator.shopName,
        });
      }

      // Normal login with PIN
      if (!existingUser) {
        return NextResponse.json({ 
          error: 'PIN not set yet',
          pinNotSet: true,
          operatorName: operator.operatorName,
        }, { status: 401 });
      }

      const isValid = await verifyPassword(password, existingUser.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
      }

      // Update login info
      await Operator.findOneAndUpdate(
        { operatorId: operator.operatorId },
        { $set: { lastLoginAt: new Date(), lastAppOpenAt: new Date() }, $inc: { appOpenCount: 1 } }
      );

      // Log activity
      const ActivityLog = (await import('@/lib/models/ActivityLog')).default;
      const { v4: uuidv4 } = await import('uuid');
      await ActivityLog.create({
        logId: `LOG-${uuidv4().slice(0, 8).toUpperCase()}`,
        userId: existingUser._id.toString(),
        operatorId: operator.operatorId,
        role: 'operator',
        action: 'login',
        description: `Operator ${operator.operatorName} logged in`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        deviceInfo: req.headers.get('user-agent') || 'unknown',
      });

      const token = generateToken({
        userId: existingUser._id.toString(),
        role: 'operator',
        operatorId: operator.operatorId,
        name: operator.operatorName,
      });

      return NextResponse.json({ 
        token, 
        user: { 
          id: existingUser._id, 
          name: operator.operatorName, 
          role: 'operator',
          operatorId: operator.operatorId,
          mobile: operator.mobile,
          walletBalance: operator.walletBalance,
          shopName: operator.shopName,
        } 
      });
    }
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errMsg = error instanceof Error ? error.message : '';
    if (errMsg.includes('Could not connect') || errMsg.includes('ServerSelection') || errMsg.includes('ECONNREFUSED')) {
      return NextResponse.json({ error: 'Database connection failed. Please check your internet connection and MongoDB Atlas IP whitelist.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
