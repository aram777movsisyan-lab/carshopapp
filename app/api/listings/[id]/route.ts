import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { listingUpdateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { seller: true, relatedCar: true }
    });
    if (!listing) {
      throw new ApiError(404, 'Listing not found');
    }
    return jsonResponse({ listing });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) {
      throw new ApiError(404, 'Listing not found');
    }
    if (listing.sellerId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    const json = await request.json();
    const parsed = listingUpdateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const data = parsed.data;
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...data,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
        images: data.images,
        isActive: data.isActive
      }
    });
    return jsonResponse({ listing: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) {
      throw new ApiError(404, 'Listing not found');
    }
    if (listing.sellerId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }
    await prisma.listing.delete({ where: { id: params.id } });
    return jsonResponse({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
