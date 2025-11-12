import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { bookingCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');

    let bookings;
    if (view === 'shop' && user.role === Role.SHOP_OWNER) {
      const shop = await prisma.shop.findFirst({ where: { ownerId: user.id } });
      if (!shop) {
        throw new ApiError(404, 'Shop not found for owner');
      }
      bookings = await prisma.booking.findMany({
        where: { shopId: shop.id },
        include: { user: true, serviceOffer: true }
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: { shop: true, serviceOffer: true }
      });
    }

    return jsonResponse({ bookings });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = bookingCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const data = parsed.data;

    const shop = await prisma.shop.findUnique({ where: { id: data.shopId } });
    if (!shop) {
      throw new ApiError(404, 'Shop not found');
    }

    if (data.serviceOfferId) {
      const service = await prisma.serviceOffer.findFirst({
        where: { id: data.serviceOfferId, shopId: shop.id }
      });
      if (!service) {
        throw new ApiError(400, 'Invalid serviceOfferId for shop');
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        shopId: shop.id,
        serviceOfferId: data.serviceOfferId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes
      }
    });

    return jsonResponse({ booking }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
