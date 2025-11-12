import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CarDetailPage({ params }: { params: { id: string } }) {
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { mods: true, user: true }
  });
  if (!car) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {car.mainPhotoUrl ? (
          <div className="relative h-64 w-full overflow-hidden rounded-2xl md:h-80 md:w-1/2">
            <Image src={car.mainPhotoUrl} alt={`${car.make} ${car.model}`} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500 md:h-80 md:w-1/2">
            No photo yet
          </div>
        )}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-semibold text-gray-900">
            {car.year} {car.make} {car.model}
          </h1>
          {car.nickname && <p className="mt-1 text-lg text-gray-600">“{car.nickname}”</p>}
          <p className="mt-2 text-sm text-gray-500">
            Owned by{' '}
            <Link href={`/users/${car.user.username}`} className="text-brand-600">
              {car.user.name}
            </Link>
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
            {car.color && (
              <div>
                <dt className="font-medium text-gray-500">Color</dt>
                <dd>{car.color}</dd>
              </div>
            )}
            {car.engine && (
              <div>
                <dt className="font-medium text-gray-500">Engine</dt>
                <dd>{car.engine}</dd>
              </div>
            )}
            {car.transmission && (
              <div>
                <dt className="font-medium text-gray-500">Transmission</dt>
                <dd>{car.transmission}</dd>
              </div>
            )}
            {car.mileage && (
              <div>
                <dt className="font-medium text-gray-500">Mileage</dt>
                <dd>{car.mileage.toLocaleString()} km</dd>
              </div>
            )}
          </dl>
          {car.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-600">
              {car.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-brand-50 px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Modification timeline</h2>
        {car.mods.length === 0 && <p className="text-sm text-gray-600">No modifications listed yet.</p>}
        <div className="space-y-3">
          {car.mods.map((mod) => (
            <article key={mod.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">{mod.title}</h3>
              <p className="text-xs uppercase text-gray-400">{mod.category}</p>
              {mod.description && <p className="mt-2 text-sm text-gray-600">{mod.description}</p>}
              <div className="mt-2 text-xs text-gray-500">
                {mod.installedAt && <span>Installed {new Date(mod.installedAt).toLocaleDateString()}</span>}
                {mod.cost && <span className="ml-3">Cost: ${mod.cost.toString()}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
