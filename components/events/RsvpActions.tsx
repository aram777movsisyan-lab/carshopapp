'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

type Status = 'GOING' | 'INTERESTED' | 'NONE';

interface Props {
  eventId: string;
  initialStatus: Status;
}

export function RsvpActions({ eventId, initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState<Status | null>(null);

  async function updateStatus(nextStatus: Status) {
    setLoading(nextStatus);
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        setStatus(nextStatus);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-4 flex gap-3">
      <Button
        onClick={() => updateStatus('GOING')}
        loading={loading === 'GOING'}
        className="bg-brand-600 text-white hover:bg-brand-700"
      >
        {status === 'GOING' ? 'You are going' : 'Mark as going'}
      </Button>
      <Button
        onClick={() => updateStatus('INTERESTED')}
        loading={loading === 'INTERESTED'}
        variant="secondary"
      >
        {status === 'INTERESTED' ? 'Interested' : 'Mark interested'}
      </Button>
    </div>
  );
}
