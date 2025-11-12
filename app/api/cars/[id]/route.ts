import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { carUpdateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
      include: { mods: true, user: true }
    });
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }
    return jsonResponse({ car });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const car = await prisma.car.findUnique({ where: { id: params.id } });
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }
    if (car.userId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    const json = await request.json();
    const parsed = carUpdateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const updated = await prisma.car.update({
      where: { id: params.id },
      data: parsed.data
    });
    return jsonResponse({ car: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const car = await prisma.car.findUnique({ where: { id: params.id } });
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }
    if (car.userId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    await prisma.car.delete({ where: { id: params.id } });
    return jsonResponse({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
