import { prisma } from '@/lib/prisma';
import { jsonResponse, handleRouteError } from '@/lib/http';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const attendees = await prisma.eventAttendee.findMany({
      where: { eventId: params.id },
      include: { user: true }
    });
    return jsonResponse({ attendees });
  } catch (error) {
    return handleRouteError(error);
  }
}
