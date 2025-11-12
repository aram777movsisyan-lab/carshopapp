import { ButtonHTMLAttributes } from 'react';
import clsx from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, className, children, ...props }: ButtonProps) {
  const styles = clsx(
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
      'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500': variant === 'primary',
      'border border-brand-500 text-brand-600 hover:bg-brand-50 focus:ring-brand-500': variant === 'secondary',
      'text-gray-700 hover:bg-gray-100 focus:ring-brand-500': variant === 'ghost'
    },
    className
  );

  return (
    <button className={styles} disabled={loading || props.disabled} {...props}>
      {loading ? 'Loading…' : children}
    </button>
  );
}
