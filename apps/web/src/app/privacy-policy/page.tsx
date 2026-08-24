import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | LifestudioCanada',
  description: 'Learn how LifestudioCanada collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="lead text-lg text-zinc-600 dark:text-zinc-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <section className="mt-12 space-y-6 text-zinc-700 dark:text-zinc-300">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when you create an account, specifically when using Google Login. This includes your name, email address, and profile picture. This data is essential to establish your identity as a creator on our platform.
              </p>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">2. How We Use Your Information</h2>
              <p>
                We use the information we collect solely for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>To authenticate your identity and secure your account.</li>
                <li>To facilitate the uploading, tracking, and management of your video submissions.</li>
                <li>To process payouts and rewards for approved content.</li>
                <li>To communicate with you regarding your account, submissions, and platform updates.</li>
              </ul>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">3. Information Sharing and Disclosure</h2>
              <p>
                We do not sell, rent, or trade your personal information to third parties. We may share your information only with trusted service providers who assist us in operating our platform, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
              </p>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">5. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us through our official support channels.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
