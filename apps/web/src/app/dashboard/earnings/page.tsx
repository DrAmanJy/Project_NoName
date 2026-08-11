import type { Metadata } from 'next';
import { EarningsView } from '@/components/dashboard/earnings-view';

export const metadata: Metadata = {
  title: 'Earnings & Submissions | Synax',
  description: 'Track expected earnings and view video submission status.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EarningsPage() {
  return <EarningsView />;
}
