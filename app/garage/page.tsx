import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { CarForm } from '@/components/garage/CarForm';
import Link from 'next/link';

export default async function GaragePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    include: { mods: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Garage"
        description="Document your builds and keep track of every modification."
        actions={<Link href={`/users/${user.username}`} className="text-sm text-brand-600">View public profile</Link>}
      />

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Add a new car</h2>
        <p className="mt-1 text-sm text-gray-600">Share the essentials of your build and tag its style.</p>
        <div className="mt-4">
          <CarForm />
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {cars.length === 0 && <p className="text-sm text-gray-600">You haven&apos;t added any cars yet.</p>}
        {cars.map((car) => (
          <Card key={car.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="text-sm text-gray-600">{car.nickname ?? 'No nickname'}</p>
              </div>
              <Link href={`/cars/${car.id}`} className="text-brand-600 text-sm">
                View
              </Link>
            </div>
            {car.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand-600">
                {car.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-50 px-3 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Modifications</h4>
              {car.mods.length === 0 && <p className="text-sm text-gray-500">No mods recorded yet.</p>}
              {car.mods.map((mod) => (
                <div key={mod.id} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-medium text-gray-900">{mod.title}</p>
                  {mod.category && <p className="text-xs uppercase text-gray-400">{mod.category}</p>}
                  {mod.description && <p className="mt-1 text-sm text-gray-600">{mod.description}</p>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
