import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

interface EventsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

  const events = await prisma.event.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(city ? { city } : {})
    },
    include: { creator: true, attendees: true },
    orderBy: { dateTimeStart: 'asc' }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events"
        description="Track meets, shows, and track days happening in your area."
        actions={<Link href="/events/new" className="text-sm text-brand-600">Host event</Link>}
      />

      <form className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <input name="q" placeholder="Search events" defaultValue={q ?? ''} className="flex-1" />
        <input name="city" placeholder="City" defaultValue={city ?? ''} className="md:w-48" />
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        {events.length === 0 && <p className="text-sm text-gray-600">No events scheduled yet.</p>}
        {events.map((event) => (
          <Card key={event.id} className="p-6">
            <p className="text-xs uppercase text-gray-400">{event.category}</p>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">{event.title}</h2>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{event.description}</p>
            <p className="mt-3 text-sm text-gray-500">
              {event.city ?? 'Unknown city'}, {event.country ?? 'Unknown country'}
            </p>
            <p className="text-sm text-gray-500">{new Date(event.dateTimeStart).toLocaleString()}</p>
            <Link href={`/events/${event.id}`} className="mt-3 inline-block text-brand-600">
              View details
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
