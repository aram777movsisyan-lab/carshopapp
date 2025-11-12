import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { favoriteCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    return jsonResponse({ favorites });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = favoriteCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: parsed.data.targetType,
          targetId: parsed.data.targetId
        }
      },
      update: {},
      create: {
        userId: user.id,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId
      }
    });

    return jsonResponse({ favorite }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
