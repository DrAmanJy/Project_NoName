import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earnings',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EarningsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">Earnings</h1>
      <p className="mt-4 text-lg text-foreground/70">
        Track your earnings and payments.
      </p>
    </main>
  );
}
