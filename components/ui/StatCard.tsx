import { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
}

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    </Card>
  );
}
