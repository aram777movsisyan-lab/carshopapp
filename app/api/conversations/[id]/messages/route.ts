import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, jsonResponse, handleRouteError } from '@/lib/http';
import { messageCreateSchema } from '@/lib/validators';
import { requireUser } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { participants: true }
    });
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    const isParticipant = conversation.participants.some((p) => p.userId === user.id);
    if (!isParticipant) {
      throw new ApiError(403, 'Forbidden');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' }
    });
    return jsonResponse({ messages });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { participants: true }
    });
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }
    const isParticipant = conversation.participants.some((p) => p.userId === user.id);
    if (!isParticipant) {
      throw new ApiError(403, 'Forbidden');
    }

    const json = await request.json();
    const parsed = messageCreateSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid payload', parsed.error.flatten());
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        content: parsed.data.content
      }
    });
    return jsonResponse({ message }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
