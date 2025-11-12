import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { conversationCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id }
        }
      },
      include: {
        participants: { include: { user: true } },
        listing: true,
        shop: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return jsonResponse({ conversations });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const json = await request.json();
    const parsed = conversationCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }
    const data = parsed.data;

    if (!data.listingId && !data.shopId) {
      throw new ApiError(400, 'listingId or shopId must be provided');
    }

    const conversation = await prisma.conversation.create({
      data: {
        listingId: data.listingId,
        shopId: data.shopId,
        participants: {
          create: [
            { userId: user.id },
            { userId: data.participantId }
          ]
        }
      },
      include: {
        participants: true
      }
    });

    return jsonResponse({ conversation }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
