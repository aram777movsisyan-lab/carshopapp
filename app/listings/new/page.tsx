import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ListingForm } from '@/components/listings/ListingForm';

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create listing" description="Reach the AutoHub community with your car, part, or service." />
      <Card className="p-6">
        <ListingForm />
      </Card>
    </div>
  );
}
