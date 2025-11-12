'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/Input';

interface ServiceFormProps {
  shopId: string;
}

export function ServiceForm({ shopId }: ServiceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    basePrice: '',
    durationMinutes: '',
    category: 'MAINTENANCE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/shops/${shopId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          basePrice: form.basePrice ? Number(form.basePrice) : undefined,
          durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
          category: form.category
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? 'Failed to create service');
      } else {
        router.refresh();
        setForm({ title: '', description: '', basePrice: '', durationMinutes: '', category: 'MAINTENANCE' });
      }
    } catch (err) {
      setError('Unexpected error creating service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <InputField label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
      <InputField
        label="Description"
        textarea
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <InputField
          label="Base price"
          type="number"
          value={form.basePrice}
          onChange={(e) => setForm((prev) => ({ ...prev, basePrice: e.target.value }))}
        />
        <InputField
          label="Duration (minutes)"
          type="number"
          value={form.durationMinutes}
          onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
        />
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span>Category</span>
          <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DETAILING">Detailing</option>
            <option value="TUNING">Tuning</option>
            <option value="PERFORMANCE">Performance</option>
            <option value="DIAGNOSTICS">Diagnostics</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>
        Add service
      </Button>
    </form>
  );
}
