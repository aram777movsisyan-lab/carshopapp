'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/Input';

export function CarForm() {
  const router = useRouter();
  const [form, setForm] = useState({ make: '', model: '', year: new Date().getFullYear(), tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()) : []
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? 'Failed to create car');
      } else {
        router.refresh();
        setForm({ make: '', model: '', year: new Date().getFullYear(), tags: '' });
      }
    } catch (err) {
      setError('Unexpected error creating car');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Make" value={form.make} onChange={(e) => setForm((prev) => ({ ...prev, make: e.target.value }))} required />
        <InputField label="Model" value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} required />
        <InputField
          label="Year"
          type="number"
          value={form.year}
          onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
          required
        />
      </div>
      <InputField
        label="Tags"
        placeholder="JDM, drift, stance"
        value={form.tags}
        onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>
        Add car
      </Button>
    </form>
  );
}
