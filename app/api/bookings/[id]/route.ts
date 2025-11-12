import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { bookingUpdateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { shop: true }
    });
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    const isOwner = booking.userId === user.id;
    const isShopOwner = user.role === Role.SHOP_OWNER && booking.shop.ownerId === user.id;
    if (!isOwner && !isShopOwner) {
      throw new ApiError(403, 'Forbidden');
    }

    const json = await request.json();
    const parsed = bookingUpdateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const data = parsed.data;

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        notes: data.notes
      }
    });
    return jsonResponse({ booking: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
