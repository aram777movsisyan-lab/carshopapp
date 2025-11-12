import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { RsvpActions } from '@/components/events/RsvpActions';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, user] = await Promise.all([
    prisma.event.findUnique({
      where: { id: params.id },
      include: { creator: true, attendees: { include: { user: true } }, reviews: { include: { reviewer: true } } }
    }),
    getCurrentUser()
  ]);

  if (!event) {
    notFound();
  }

  const attendeeStatus = user
    ? event.attendees.find((attendee) => attendee.userId === user.id)?.status ?? 'NONE'
    : 'NONE';

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-xs uppercase text-gray-400">{event.category}</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">{event.title}</h1>
        <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">{event.description}</p>
        <dl className="mt-4 grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-gray-500">When</dt>
            <dd>
              {new Date(event.dateTimeStart).toLocaleString()}
              {event.dateTimeEnd && <> — {new Date(event.dateTimeEnd).toLocaleString()}</>}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Where</dt>
            <dd>
              {event.locationName && <span>{event.locationName} • </span>}
              {event.city ?? 'Unknown city'}, {event.country ?? 'Unknown country'}
            </dd>
          </div>
        </dl>
        <div className="mt-4 text-sm text-gray-500">
          Hosted by{' '}
          <Link href={`/users/${event.creator.username}`} className="text-brand-600">
            {event.creator.name}
          </Link>
        </div>
        {user && <RsvpActions eventId={event.id} initialStatus={attendeeStatus as 'GOING' | 'INTERESTED' | 'NONE'} />}
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
          {event.attendees.length === 0 && <li>No RSVPs yet.</li>}
          {event.attendees.map((attendee) => (
            <li key={attendee.id} className="rounded-full bg-gray-100 px-4 py-1">
              {attendee.user.name} • {attendee.status.toLowerCase()}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        <ul className="mt-3 space-y-3 text-sm text-gray-600">
          {event.reviews.length === 0 && <li>No reviews yet.</li>}
          {event.reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{review.title}</p>
              <p className="text-xs text-gray-500">
                {review.rating}/5 by {review.reviewer.name}
              </p>
              {review.body && <p className="mt-2 text-sm text-gray-600">{review.body}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
