import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { eventRsvpSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    const json = await request.json();
    const parsed = eventRsvpSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const attendee = await prisma.eventAttendee.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id
        }
      },
      update: { status: parsed.data.status },
      create: {
        eventId: event.id,
        userId: user.id,
        status: parsed.data.status
      }
    });

    return jsonResponse({ attendee });
  } catch (error) {
    return handleRouteError(error);
  }
}
