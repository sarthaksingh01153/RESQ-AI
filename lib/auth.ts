import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'resq-ai-super-secret-jwt-key-change-in-production-2024';

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<TokenPayload | null> {
  // First try headers set by middleware
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const email = request.headers.get('x-user-email');

  if (userId && role && email) {
    return { sub: userId, email, name: '', role };
  }

  // Fallback: parse cookie directly
  const token = request.cookies.get('resq_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function hasRole(user: TokenPayload | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isOfficerOrAbove(user: TokenPayload | null): boolean {
  return hasRole(user, 'OFFICER', 'ADMIN');
}

export function isInventoryManager(user: TokenPayload | null): boolean {
  return hasRole(user, 'INVENTORY_MANAGER', 'ADMIN', 'OFFICER');
}

export function isAdmin(user: TokenPayload | null): boolean {
  return hasRole(user, 'ADMIN');
}

