import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { reviewCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

async function updateTargetRatings(targetType: 'SHOP' | 'EVENT', targetId: string) {
  const stats = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
    where: { targetType, targetId }
  });
  if (targetType === 'SHOP') {
    await prisma.shop.update({
      where: { id: targetId },
      data: {
        ratingAverage: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating
      }
    });
  } else if (targetType === 'EVENT') {
    await prisma.event.update({
      where: { id: targetId },
      data: {
        ratingAverage: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating
      }
    }).catch(() => undefined);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    if (!targetType || !targetId) {
      throw new ApiError(400, 'targetType and targetId are required');
    }

    const reviews = await prisma.review.findMany({
      where: { targetType: targetType as any, targetId },
      include: { reviewer: true },
      orderBy: { createdAt: 'desc' }
    });
    return jsonResponse({ reviews });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = reviewCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const data = parsed.data;

    const review = await prisma.review.upsert({
      where: {
        reviewerId_targetType_targetId: {
          reviewerId: user.id,
          targetType: data.targetType,
          targetId: data.targetId
        }
      },
      update: {
        rating: data.rating,
        title: data.title,
        body: data.body
      },
      create: {
        reviewerId: user.id,
        targetType: data.targetType,
        targetId: data.targetId,
        rating: data.rating,
        title: data.title,
        body: data.body
      }
    });

    await updateTargetRatings(data.targetType, data.targetId);

    return jsonResponse({ review }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
