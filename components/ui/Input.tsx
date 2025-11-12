import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import clsx from 'classnames';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  textarea?: false;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  textarea: true;
}

type Props = FieldProps | TextAreaProps;

export function InputField({ label, error, textarea, className, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      <span>{label}</span>
      {textarea ? (
        <textarea className={clsx('min-h-[120px]', className)} {...(props as TextAreaProps)} />
      ) : (
        <input className={className} {...(props as FieldProps)} />
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
