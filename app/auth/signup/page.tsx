'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error?.message ?? 'Unable to sign up');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Unexpected error signing up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Create your AutoHub account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Already a member?{' '}
          <Link href="/auth/login" className="text-brand-600">
            Log in here
          </Link>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Full name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <InputField
            label="Username"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>
        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <InputField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Sign up
        </Button>
      </form>
    </div>
  );
}
