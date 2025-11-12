'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/Input';

type EventPayload = {
  id?: string;
  title?: string;
  description?: string;
  dateTimeStart?: string;
  dateTimeEnd?: string | null;
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  category?: string;
  coverImageUrl?: string;
  maxAttendees?: number | string | null;
};

interface Props {
  event?: EventPayload;
}

export function EventForm({ event }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<EventPayload>({
    title: event?.title ?? '',
    description: event?.description ?? '',
    dateTimeStart: event?.dateTimeStart ?? new Date().toISOString().slice(0, 16),
    dateTimeEnd: event?.dateTimeEnd ?? '',
    locationName: event?.locationName ?? '',
    address: event?.address ?? '',
    city: event?.city ?? '',
    state: event?.state ?? '',
    country: event?.country ?? '',
    category: event?.category ?? 'MEET',
    coverImageUrl: event?.coverImageUrl ?? '',
    maxAttendees: event?.maxAttendees ?? ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(eventObj: React.FormEvent) {
    eventObj.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        dateTimeStart: new Date(form.dateTimeStart as string).toISOString(),
        dateTimeEnd: form.dateTimeEnd ? new Date(form.dateTimeEnd as string).toISOString() : undefined,
        locationName: form.locationName,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        category: form.category,
        coverImageUrl: form.coverImageUrl || undefined,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined
      };
      const response = await fetch(event?.id ? `/api/events/${event.id}` : '/api/events', {
        method: event?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? 'Failed to save event');
      } else {
        router.push(`/events/${event?.id ?? data.data?.event?.id ?? data.event?.id ?? ''}`);
        router.refresh();
      }
    } catch (err) {
      setError('Unexpected error saving event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          <span>Category</span>
          <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
            <option value="MEET">Meet</option>
            <option value="SHOW">Show</option>
            <option value="TRACK">Track</option>
            <option value="CRUISE">Cruise</option>
          </select>
        </label>
      </div>
      <InputField
        label="Description"
        textarea
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Start"
          type="datetime-local"
          value={form.dateTimeStart}
          onChange={(e) => setForm((prev) => ({ ...prev, dateTimeStart: e.target.value }))}
          required
        />
        <InputField
          label="End"
          type="datetime-local"
          value={form.dateTimeEnd ?? ''}
          onChange={(e) => setForm((prev) => ({ ...prev, dateTimeEnd: e.target.value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Location name" value={form.locationName ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, locationName: e.target.value }))} />
        <InputField label="City" value={form.city ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
        <InputField label="Country" value={form.country ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
      </div>
      <InputField label="Cover image URL" value={form.coverImageUrl ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, coverImageUrl: e.target.value }))} />
      <InputField
        label="Max attendees"
        type="number"
        value={form.maxAttendees ?? ''}
        onChange={(e) => setForm((prev) => ({ ...prev, maxAttendees: e.target.value }))}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" loading={loading}>
        {event?.id ? 'Update event' : 'Publish event'}
      </Button>
    </form>
  );
}
