import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ListingForm } from '@/components/listings/ListingForm';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing || listing.sellerId !== user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit listing" description="Keep your listing up to date with the latest details." />
      <Card className="p-6">
        <ListingForm listing={{
          id: listing.id,
          type: listing.type,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          price: Number(listing.price),
          currency: listing.currency,
          condition: listing.condition,
          city: listing.city ?? '',
          state: listing.state ?? '',
          country: listing.country ?? '',
          images: listing.images
        }} />
      </Card>
    </div>
  );
}
