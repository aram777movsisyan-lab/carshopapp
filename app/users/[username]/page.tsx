import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { cars: { include: { mods: true } }, listings: { take: 6, orderBy: { createdAt: 'desc' } } }
  });
  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">{user.name}</h1>
        <p className="text-sm text-gray-500">@{user.username}</p>
        {user.bio && <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">{user.bio}</p>}
        <p className="mt-2 text-sm text-gray-500">
          {user.city && `${user.city}, `}
          {user.country}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Garage</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {user.cars.length === 0 && <p className="text-sm text-gray-600">No cars shared yet.</p>}
          {user.cars.map((car) => (
            <div key={car.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                {car.year} {car.make} {car.model}
              </h3>
              {car.nickname && <p className="text-sm text-gray-600">“{car.nickname}”</p>}
              <p className="mt-2 text-sm text-gray-500">{car.tags.map((tag) => `#${tag}`).join(' ')}</p>
              <Link href={`/cars/${car.id}`} className="mt-3 inline-block text-sm text-brand-600">
                View build
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Latest listings</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {user.listings.length === 0 && <p className="text-sm text-gray-600">No listings yet.</p>}
          {user.listings.map((listing) => (
            <div key={listing.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase text-gray-400">{listing.type}</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">{listing.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{listing.description}</p>
              <Link href={`/listings/${listing.id}`} className="mt-3 inline-block text-sm text-brand-600">
                View listing
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
