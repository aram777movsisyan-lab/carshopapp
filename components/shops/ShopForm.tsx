'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/Input';

interface ShopFormProps {
  shop?: {
    id: string;
    name: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    website?: string | null;
    logoUrl?: string | null;
  } | null;
}

export function ShopForm({ shop }: ShopFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: shop?.name ?? '',
    description: shop?.description ?? '',
    address: shop?.address ?? '',
    city: shop?.city ?? '',
    state: shop?.state ?? '',
    country: shop?.country ?? '',
    phone: shop?.phone ?? '',
    website: shop?.website ?? '',
    logoUrl: shop?.logoUrl ?? ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(shop ? `/api/shops/${shop.id}` : '/api/shops', {
        method: shop ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? 'Failed to save shop');
      } else {
        router.refresh();
      }
    } catch (err) {
      setError('Unexpected error saving shop');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField label="Shop name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
      <InputField
        label="Description"
        textarea
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
      />
      <InputField label="Address" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="City" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
        <InputField label="State" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} />
        <InputField label="Country" value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
        <InputField label="Website" value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} />
        <InputField label="Logo URL" value={form.logoUrl} onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>
        {shop ? 'Update shop' : 'Create shop'}
      </Button>
    </form>
  );
}
