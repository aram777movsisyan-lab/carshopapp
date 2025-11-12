import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

interface ListingsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;

  const listings = await prisma.listing.findMany({
    where: {
      isActive: true,
      ...(type ? { type } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {})
    },
    include: { seller: true, relatedCar: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Marketplace"
        description="Find cars, parts, and services from trusted members of the AutoHub community."
        actions={<Link href="/listings/new" className="text-sm text-brand-600">Create listing</Link>}
      />

      <form className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search listings"
          className="flex-1"
        />
        <select name="type" defaultValue={type ?? ''} className="md:w-48">
          <option value="">All types</option>
          <option value="CAR">Cars</option>
          <option value="PART">Parts</option>
          <option value="SERVICE">Services</option>
        </select>
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.length === 0 && <p className="text-sm text-gray-600">No listings found.</p>}
        {listings.map((listing) => (
          <Card key={listing.id} className="flex h-full flex-col">
            <div className="flex-1 space-y-2 p-5">
              <p className="text-xs uppercase text-gray-400">{listing.type}</p>
              <h2 className="text-lg font-semibold text-gray-900">{listing.title}</h2>
              <p className="text-sm text-gray-600 line-clamp-3">{listing.description}</p>
            </div>
            <div className="border-t border-gray-100 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">${listing.price.toString()} {listing.currency}</p>
              <p className="text-xs text-gray-500">
                {listing.city ?? 'Unknown city'}, {listing.country ?? 'Unknown country'}
              </p>
              <Link href={`/listings/${listing.id}`} className="mt-2 inline-block text-brand-600">
                View details
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
