import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { seller: true, relatedCar: { include: { mods: true } } }
  });
  if (!listing) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 md:flex-row">
        {listing.images[0] ? (
          <div className="relative h-64 w-full overflow-hidden rounded-2xl md:h-80 md:w-1/2">
            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500 md:h-80 md:w-1/2">
            No photo available
          </div>
        )}
        <div className="md:w-1/2">
          <p className="text-xs uppercase text-gray-400">{listing.type}</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">{listing.title}</h1>
          <p className="mt-4 whitespace-pre-line text-sm text-gray-700">{listing.description}</p>
          <div className="mt-4 text-sm text-gray-600">
            <p className="text-lg font-semibold text-gray-900">
              ${listing.price.toString()} {listing.currency}
            </p>
            <p>
              {listing.city ?? 'Unknown city'}, {listing.state ?? '—'}, {listing.country ?? 'Unknown country'}
            </p>
            <p>Condition: {listing.condition}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link href={`/messages?participant=${listing.sellerId}&listing=${listing.id}`} className="rounded-md bg-brand-600 px-4 py-2 text-white">
              Contact seller
            </Link>
            {listing.relatedCar && (
              <Link href={`/cars/${listing.relatedCar.id}`} className="rounded-md border border-brand-500 px-4 py-2 text-brand-600">
                View related car
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Seller</h2>
        <p className="mt-1 text-sm text-gray-600">
          <Link href={`/users/${listing.seller.username}`} className="text-brand-600">
            {listing.seller.name}
          </Link>{' '}
          • Joined {new Date(listing.seller.createdAt).toLocaleDateString()}
        </p>
        {listing.relatedCar && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900">Garage car linked</h3>
            <p className="text-sm text-gray-600">
              {listing.relatedCar.year} {listing.relatedCar.make} {listing.relatedCar.model}
            </p>
            {listing.relatedCar.mods.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-gray-500">
                {listing.relatedCar.mods.slice(0, 3).map((mod) => (
                  <li key={mod.id}>{mod.title}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
