import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { signupSchema } from '@/lib/validators';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = signupSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const { name, username, email, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });
    if (existing) {
      throw new ApiError(409, 'User already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash
      }
    });

    await setAuthCookie(user);
    return jsonResponse({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
