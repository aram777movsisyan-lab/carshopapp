import Link from 'next/link';

const sections = [
  {
    title: 'Explore Marketplace',
    description: 'Buy and sell cars, parts, and services from trusted enthusiasts and shops.',
    href: '/listings',
    cta: 'Browse listings'
  },
  {
    title: 'Find Shops',
    description: 'Discover rated mechanics, detailers, tuners, and specialists near you.',
    href: '/shops',
    cta: 'Find a shop'
  },
  {
    title: 'Discover Events',
    description: 'Track days, meets, and shows curated for the community.',
    href: '/events',
    cta: 'See upcoming events'
  }
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="rounded-3xl bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-16 text-white shadow-xl">
        <h1 className="text-4xl font-bold sm:text-5xl">Welcome to AutoHub</h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-50">
          AutoHub is your all-in-one ecosystem to showcase your builds, connect with service providers, find events, and
          trade anything automotive.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur" href="/auth/signup">
            Join the community
          </Link>
          <Link className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-600" href="/listings">
            Browse the marketplace
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{section.description}</p>
            <Link href={section.href} className="mt-4 inline-flex text-sm font-medium text-brand-600">
              {section.cta}
            </Link>
          </div>
        ))}
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">For Enthusiasts</h2>
          <p className="mt-3 text-sm text-gray-600">
            Showcase your garage, track modifications, and share your story. Follow other builds and find inspiration
            for your next upgrade.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Create detailed car profiles with photos and mod history.</li>
            <li>• Favorite listings, shops, and events.</li>
            <li>• Message sellers, buyers, and shops directly.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">For Shops & Vendors</h2>
          <p className="mt-3 text-sm text-gray-600">
            Grow your business with service listings, bookings, reviews, and a marketplace presence tailored for the
            automotive industry.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Offer services with transparent pricing and durations.</li>
            <li>• Manage bookings and communicate with customers.</li>
            <li>• Promote events and special promotions to the community.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
