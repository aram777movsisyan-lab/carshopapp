import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';

interface ShopsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ShopsPage({ searchParams }: ShopsPageProps) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

  const shops = await prisma.shop.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(city ? { city } : {})
    },
    include: { services: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Service directory"
        description="Discover trusted shops for maintenance, detailing, tuning, and more."
        actions={<Link href="/shops/my-shop" className="text-sm text-brand-600">Manage my shop</Link>}
      />

      <form className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <input name="q" placeholder="Search shops" defaultValue={q ?? ''} className="flex-1" />
        <input name="city" placeholder="City" defaultValue={city ?? ''} className="md:w-48" />
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white">
          Filter
        </button>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        {shops.length === 0 && <p className="text-sm text-gray-600">No shops found yet.</p>}
        {shops.map((shop) => (
          <Card key={shop.id} className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">{shop.name}</h2>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{shop.description ?? 'No description yet.'}</p>
            <p className="mt-3 text-sm text-gray-500">{shop.city ?? 'Unknown city'}, {shop.country ?? 'Unknown country'}</p>
            <p className="text-sm text-gray-500">
              Rating: {shop.ratingAverage?.toFixed(1) ?? '0.0'} ({shop.ratingCount} reviews)
            </p>
            <Link href={`/shops/${shop.id}`} className="mt-3 inline-block text-brand-600">
              View profile
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
