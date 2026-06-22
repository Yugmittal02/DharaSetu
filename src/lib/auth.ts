import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'dharasetu-default-secret') {
    console.warn('⚠️ WARNING: JWT_SECRET is not set! Set it in environment variables for security.');
    return 'dharasetu-fallback-secret-please-set-JWT_SECRET';
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  role: 'super_admin' | 'admin' | 'operator';
  operatorId?: string;
  name: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const expiresIn = payload.role === 'operator' ? '12h' : '24h';
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookieToken = req.cookies.get('dharasetu_token')?.value;
  return cookieToken || null;
}

export function authenticateRequest(req: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function authorizeRoles(user: JWTPayload | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
