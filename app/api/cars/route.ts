import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { carCreateSchema } from '@/lib/validators';
import { getCurrentUser, requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const currentUser = await getCurrentUser();
    const ownerId = userId ?? currentUser?.id;

    if (!ownerId) {
      throw new ApiError(400, 'userId query parameter required');
    }

    const cars = await prisma.car.findMany({
      where: { userId: ownerId },
      include: { mods: true }
    });

    return jsonResponse({ cars });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = carCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const car = await prisma.car.create({
      data: {
        ...parsed.data,
        tags: parsed.data.tags ?? [],
        userId: user.id
      }
    });

    return jsonResponse({ car }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
