import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { shopCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      include: { services: true, owner: true, reviews: true }
    });
    if (!shop) {
      throw new ApiError(404, 'Shop not found');
    }
    return jsonResponse({ shop });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(Role.SHOP_OWNER);
    const shop = await prisma.shop.findUnique({ where: { id: params.id } });
    if (!shop) {
      throw new ApiError(404, 'Shop not found');
    }
    if (shop.ownerId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    const json = await request.json();
    const parsed = shopCreateSchema.partial().safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const updated = await prisma.shop.update({
      where: { id: params.id },
      data: parsed.data
    });
    return jsonResponse({ shop: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
