import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const [cars, listings, bookings, conversations] = await Promise.all([
    prisma.car.findMany({ where: { userId: user.id } }),
    prisma.listing.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.booking.findMany({
      where: { OR: [{ userId: user.id }, { shop: { ownerId: user.id } }] },
      include: { shop: true, serviceOffer: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 }, participants: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Welcome, ${user.name}`}
        description="Manage your garage, marketplace listings, bookings, and conversations from a single place."
        actions={<Link href="/listings/new" className="text-sm text-brand-600">Create listing</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Cars in garage" value={cars.length} />
        <StatCard title="Active listings" value={listings.length} />
        <StatCard title="Upcoming bookings" value={bookings.filter((b) => b.status === 'CONFIRMED').length} />
        <StatCard title="Conversations" value={conversations.length} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent listings</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            {listings.length === 0 && <li>No listings yet. <Link href="/listings/new">Create your first listing</Link>.</li>}
            {listings.map((listing) => (
              <li key={listing.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{listing.title}</p>
                  <p className="text-xs text-gray-500">{listing.type} • {listing.city ?? 'No city'}</p>
                </div>
                <Link href={`/listings/${listing.id}/edit`} className="text-brand-600">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Latest bookings</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            {bookings.length === 0 && <li>No bookings yet.</li>}
            {bookings.map((booking) => (
              <li key={booking.id}>
                <p className="font-medium text-gray-900">{booking.shop.name}</p>
                <p className="text-xs text-gray-500">
                  {booking.status} • {new Date(booking.scheduledAt).toLocaleString()} • {booking.serviceOffer?.title ?? 'Custom request'}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent conversations</h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-600">
          {conversations.length === 0 && <li>No conversations yet.</li>}
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages[0];
            const other = conversation.participants.find((p) => p.userId !== user.id)?.user;
            return (
              <li key={conversation.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{other?.name ?? 'Conversation'}</p>
                  <p className="text-xs text-gray-500">{lastMessage?.content ?? 'No messages yet'}</p>
                </div>
                <Link href={`/messages?conversation=${conversation.id}`} className="text-brand-600">
                  View
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
