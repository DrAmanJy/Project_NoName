import type { Metadata } from 'next';
import { LoginModal } from '@/components/auth/login-modal';
import MarketingHomePage from '@/app/(marketing)/page';

export const metadata: Metadata = {
  title: 'Sign In to Synex',
  description: 'Access your Synex creator account to submit videos and track payouts.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Sign In to Synex',
    description: 'Access your Synex creator account to submit videos and track payouts.',
    url: '/login',
  },
  twitter: {
    card: 'summary',
    title: 'Sign In to Synex',
    description: 'Access your Synex creator account to submit videos and track payouts.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Page Render */}
      <div className="pointer-events-none select-none filter blur-[2px] opacity-80 aria-hidden">
        <MarketingHomePage />
      </div>

      {/* Login Popup Modal */}
      <LoginModal />
    </div>
  );
}
