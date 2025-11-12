import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { MessagesClient } from '@/components/messages/MessagesClient';

interface MessagesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      listing: true,
      shop: true,
      participants: { include: { user: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  });

  const summaries = conversations.map((conversation) => {
    const other = conversation.participants.find((participant) => participant.userId !== user.id)?.user;
    const title = conversation.listing?.title ?? conversation.shop?.name ?? other?.name ?? 'Conversation';
    const preview = conversation.messages[0]?.content ?? 'No messages yet';
    return {
      id: conversation.id,
      title,
      preview
    };
  });

  const initialConversationId = typeof searchParams.conversation === 'string' ? searchParams.conversation : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Coordinate deals and bookings across the AutoHub platform." />
      <MessagesClient conversations={summaries} initialConversationId={initialConversationId} />
    </div>
  );
}
