import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { serviceOfferCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';
import { Prisma, Role } from '@prisma/client';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const services = await prisma.serviceOffer.findMany({
      where: { shopId: params.id },
      orderBy: { createdAt: 'desc' }
    });
    return jsonResponse({ services });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const parsed = serviceOfferCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const service = await prisma.serviceOffer.create({
      data: {
        ...parsed.data,
        basePrice: parsed.data.basePrice !== undefined ? new Prisma.Decimal(parsed.data.basePrice) : undefined,
        shopId: shop.id
      }
    });

    return jsonResponse({ service }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
