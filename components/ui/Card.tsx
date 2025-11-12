import { ReactNode } from 'react';
import clsx from 'classnames';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={clsx('rounded-2xl border border-gray-200 bg-white shadow-sm', className)}>{children}</div>;
}
