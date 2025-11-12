import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { modCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { carId: string } }) {
  try {
    const mods = await prisma.mod.findMany({ where: { carId: params.carId } });
    return jsonResponse({ mods });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { carId: string } }) {
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
    const parsed = modCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const mod = await prisma.mod.create({
      data: {
        ...parsed.data,
        installedAt: parsed.data.installedAt ? new Date(parsed.data.installedAt) : undefined,
        cost: parsed.data.cost,
        carId: car.id
      }
    });
    return jsonResponse({ mod }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
