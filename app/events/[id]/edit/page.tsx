import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EventForm } from '@/components/events/EventForm';

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event || event.creatorId !== user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit event" description="Keep your event details fresh for attendees." />
      <Card className="p-6">
        <EventForm
          event={{
            id: event.id,
            title: event.title,
            description: event.description ?? '',
            dateTimeStart: event.dateTimeStart.toISOString().slice(0, 16),
            dateTimeEnd: event.dateTimeEnd ? event.dateTimeEnd.toISOString().slice(0, 16) : '',
            locationName: event.locationName ?? '',
            address: event.address ?? '',
            city: event.city ?? '',
            state: event.state ?? '',
            country: event.country ?? '',
            category: event.category,
            coverImageUrl: event.coverImageUrl ?? '',
            maxAttendees: event.maxAttendees ?? ''
          }}
        />
      </Card>
    </div>
  );
}
