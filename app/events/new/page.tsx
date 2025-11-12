import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EventForm } from '@/components/events/EventForm';

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Host a new event" description="Share your meet, show, or track day with the AutoHub community." />
      <Card className="p-6">
        <EventForm />
      </Card>
    </div>
  );
}
