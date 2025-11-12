import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { modCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { carId: string; modId: string } }) {
  try {
    const user = await requireUser();
    const car = await prisma.car.findUnique({ where: { id: params.carId } });
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }
    if (car.userId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    const json = await request.json();
    const parsed = modCreateSchema.partial().safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const mod = await prisma.mod.update({
      where: { id: params.modId },
      data: {
        ...parsed.data,
        installedAt: parsed.data.installedAt ? new Date(parsed.data.installedAt) : undefined
      }
    });
    return jsonResponse({ mod });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { carId: string; modId: string } }) {
  try {
    const user = await requireUser();
    const car = await prisma.car.findUnique({ where: { id: params.carId } });
    if (!car) {
      throw new ApiError(404, 'Car not found');
    }
    if (car.userId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    await prisma.mod.delete({ where: { id: params.modId } });
    return jsonResponse({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
