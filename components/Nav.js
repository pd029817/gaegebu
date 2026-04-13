'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const path = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className={`navItem ${path === '/' ? 'active' : ''}`}>📒 가계부</Link>
      <Link href="/dashboard" className={`navItem ${path === '/dashboard' ? 'active' : ''}`}>📊 대시보드</Link>
    </nav>
  );
}
