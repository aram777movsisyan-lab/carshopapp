import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { Role, User } from '@prisma/client';

const AUTH_COOKIE = 'autohub_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signUserToken(user: User) {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: COOKIE_MAX_AGE }
  );
}

export function verifyUserToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(user: User) {
  const token = signUserToken(user);
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE
  });
  return token;
}

export function clearAuthCookie() {
  cookies().delete(AUTH_COOKIE);
}

export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const payload = verifyUserToken(token);
  if (!payload) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });
  return user;
}

export async function requireUser(role?: Role) {
  const user = await getCurrentUser();
  if (!user) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  if (role && user.role !== role) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }
  return user;
}
