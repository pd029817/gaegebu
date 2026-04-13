'use client';

import dynamic from 'next/dynamic';

export const GaegebuClient = dynamic(
  () => import('./Gaegebu'),
  { ssr: false }
);

export const DashboardClient = dynamic(
  () => import('./Dashboard'),
  { ssr: false }
);
