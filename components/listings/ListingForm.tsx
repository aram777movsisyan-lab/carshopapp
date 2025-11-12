'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/Input';

type ListingPayload = {
  id?: string;
  type?: string;
  title?: string;
  description?: string;
  category?: string;
  price?: number | string;
  currency?: string;
  condition?: string;
  city?: string;
  state?: string;
  country?: string;
  images?: string[];
};

interface ListingFormProps {
  listing?: ListingPayload;
}

const defaultState = {
  type: 'CAR',
  title: '',
  description: '',
  category: '',
  price: '',
  currency: 'USD',
  condition: 'USED',
  city: '',
  state: '',
  country: '',
  images: ''
};

export function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    ...defaultState,
    ...listing,
    price: listing?.price ? Number(listing.price) : '',
    images: listing?.images?.join(', ') ?? ''
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        type: form.type,
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        currency: form.currency,
        condition: form.condition,
        city: form.city,
        state: form.state,
        country: form.country,
        images: form.images
          ? form.images.split(',').map((img: string) => img.trim()).filter(Boolean)
          : []
      };
      const response = await fetch(listing?.id ? `/api/listings/${listing.id}` : '/api/listings', {
        method: listing?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? 'Failed to save listing');
      } else {
        router.push(`/listings/${data.data?.listing?.id ?? listing?.id ?? data.listing?.id ?? ''}`);
        router.refresh();
      }
    } catch (err) {
      setError('Unexpected error saving listing');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span>Type</span>
          <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
            <option value="CAR">Car</option>
            <option value="PART">Part</option>
            <option value="SERVICE">Service</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span>Condition</span>
          <select value={form.condition} onChange={(e) => setForm((prev) => ({ ...prev, condition: e.target.value }))}>
            <option value="NEW">New</option>
            <option value="USED">Used</option>
          </select>
        </label>
      </div>
      <InputField label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
      <InputField
        label="Category"
        value={form.category}
        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
        required
      />
      <InputField
        label="Description"
        textarea
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        required
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          required
        />
        <InputField
          label="Currency"
          value={form.currency}
          onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
          required
        />
        <InputField
          label="Images"
          placeholder="Comma separated URLs"
          value={form.images}
          onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="City" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
        <InputField label="State" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} />
        <InputField
          label="Country"
          value={form.country}
          onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>
        {listing?.id ? 'Update listing' : 'Publish listing'}
      </Button>
    </form>
  );
}
