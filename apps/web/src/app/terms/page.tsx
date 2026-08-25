import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Terms of Service | LifestudioCanada',
  description: 'Read the Terms of Service for LifestudioCanada.',
};

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="lead text-lg text-zinc-600 dark:text-zinc-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <section className="mt-12 space-y-6 text-zinc-700 dark:text-zinc-300">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing and using LifestudioCanada, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">2. User Accounts</h2>
              <p>
                To use certain features of the platform, you must register for an account using Google Login. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">3. Content Submissions</h2>
              <p>
                By submitting videos to LifestudioCanada, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, and display such content. You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to your submissions.
              </p>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">4. Payouts and Rewards</h2>
              <p>
                Users may be eligible for payouts based on approved content submissions. Payouts are subject to our review process and may be withheld if we determine that the content violates these Terms of Service or our community guidelines.
              </p>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">5. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. We will notify users of any significant changes by posting the new terms on the platform. Your continued use of the platform following the posting of changes constitutes your acceptance of such changes.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
