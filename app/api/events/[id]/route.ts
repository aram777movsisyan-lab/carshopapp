import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { eventUpdateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { creator: true, attendees: { include: { user: true } }, reviews: true }
    });
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }
    return jsonResponse({ event });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }
    if (event.creatorId !== user.id) {
      throw new ApiError(403, 'Forbidden');
    }

    const json = await request.json();
    const parsed = eventUpdateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const data = parsed.data;

    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...data,
        dateTimeStart: data.dateTimeStart ? new Date(data.dateTimeStart) : undefined,
        dateTimeEnd: data.dateTimeEnd ? new Date(data.dateTimeEnd) : undefined
      }
    });
    return jsonResponse({ event: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
