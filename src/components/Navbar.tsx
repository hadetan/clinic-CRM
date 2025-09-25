"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const navItems: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  { href: '/stocks', label: 'Stocks' },
  { href: '/prescriptions', label: 'All Prescriptions' },
];

export default function Navbar() {
  const pathname = usePathname() || '/';

  return (
    <header className="print:hidden sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight text-neutral-900 text-lg">
            Prescription
          </Link>
          <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-indigo-500 opacity-50 text-white">CRM</span>
        </div>
        <nav className="flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  'relative px-3 py-2 rounded-md transition-colors ' +
                  (active
                    ? 'text-neutral-900 font-semibold '
                    + 'after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900')
                }
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
