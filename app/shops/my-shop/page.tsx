import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ShopForm } from '@/components/shops/ShopForm';
import { ServiceForm } from '@/components/shops/ServiceForm';
import { Role } from '@prisma/client';

export default async function MyShopPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  if (user.role !== Role.SHOP_OWNER && user.role !== Role.ADMIN) {
    return (
      <div className="space-y-6">
        <PageHeader title="My shop" description="Upgrade your account to SHOP_OWNER to manage a shop." />
        <Card className="p-6">
          <p className="text-sm text-gray-600">
            Contact an administrator to enable shop owner permissions on your account. Once approved you can create your shop profile here.
          </p>
        </Card>
      </div>
    );
  }

  const shop = await prisma.shop.findFirst({ where: { ownerId: user.id }, include: { services: true } });

  return (
    <div className="space-y-6">
      <PageHeader title="Manage my shop" description="Update your shop profile and service offerings." />

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Shop profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide details about your shop so customers can learn more.
        </p>
        <div className="mt-4">
          <ShopForm shop={shop} />
        </div>
      </Card>

      {shop && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
          <p className="mt-1 text-sm text-gray-600">List packages that customers can book.</p>
          <div className="mt-4 space-y-4">
            <ServiceForm shopId={shop.id} />
            <ul className="space-y-3 text-sm text-gray-600">
              {shop.services.length === 0 && <li>No services yet.</li>}
              {shop.services.map((service) => (
                <li key={service.id} className="rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900">{service.title}</p>
                  <p className="text-xs uppercase text-gray-400">{service.category}</p>
                  {service.description && <p className="mt-2 text-sm text-gray-600">{service.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
