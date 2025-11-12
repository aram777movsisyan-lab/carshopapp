import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AutoHub',
  description: 'AutoHub – the all-in-one car ecosystem for owners, enthusiasts, and shops.'
};

const navItems = [
  { href: '/listings', label: 'Marketplace' },
  { href: '/shops', label: 'Shops' },
  { href: '/events', label: 'Events' },
  { href: '/garage', label: 'My Garage' },
  { href: '/messages', label: 'Messages' }
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-40">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <Link href="/" className="text-xl font-semibold text-brand-600">
                AutoHub
              </Link>
              <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-brand-600">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-3 text-sm">
                <Link href="/auth/login" className="rounded-md border border-brand-500 px-3 py-1.5 text-brand-600">
                  Login
                </Link>
                <Link href="/auth/signup" className="rounded-md bg-brand-600 px-3 py-1.5 text-white">
                  Sign Up
                </Link>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>&copy; {new Date().getFullYear()} AutoHub. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
