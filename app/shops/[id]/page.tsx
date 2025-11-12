import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function ShopDetailPage({ params }: { params: { id: string } }) {
  const shop = await prisma.shop.findUnique({
    where: { id: params.id },
    include: { services: true, reviews: { include: { reviewer: true } }, owner: true }
  });
  if (!shop) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">{shop.name}</h1>
        <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{shop.description ?? 'No description yet.'}</p>
        <p className="mt-2 text-sm text-gray-500">
          {shop.city ?? 'Unknown city'}, {shop.state ?? '—'}, {shop.country ?? 'Unknown country'}
        </p>
        <p className="text-sm text-gray-500">
          Rating {shop.ratingAverage?.toFixed(1) ?? '0.0'} ({shop.ratingCount} reviews)
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={`/messages?participant=${shop.ownerId}&shop=${shop.id}`} className="rounded-md bg-brand-600 px-4 py-2 text-white">
            Contact shop
          </Link>
          {shop.website && (
            <a href={shop.website} target="_blank" rel="noreferrer" className="rounded-md border border-brand-500 px-4 py-2 text-brand-600">
              Visit website
            </a>
          )}
        </div>
      </header>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Services</h2>
        <ul className="mt-3 space-y-3 text-sm text-gray-600">
          {shop.services.length === 0 && <li>No services listed yet.</li>}
          {shop.services.map((service) => (
            <li key={service.id} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{service.title}</p>
              <p className="text-xs uppercase text-gray-400">{service.category}</p>
              {service.description && <p className="mt-2 text-sm text-gray-600">{service.description}</p>}
              <p className="mt-2 text-sm text-gray-500">
                {service.basePrice ? `$${service.basePrice.toString()}` : 'Contact for pricing'}
                {service.durationMinutes && ` • ${service.durationMinutes} minutes`}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
        <ul className="mt-3 space-y-3 text-sm text-gray-600">
          {shop.reviews.length === 0 && <li>No reviews yet.</li>}
          {shop.reviews.map((review) => (
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
