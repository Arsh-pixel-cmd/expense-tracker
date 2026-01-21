
'use client';

import { BudgetNotifier } from '@/components/BudgetNotifier';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-6 md:px-10 py-8">
        <BudgetNotifier />
        {children}
      </main>
      <div className="h-16" />
    </>
  );
}
