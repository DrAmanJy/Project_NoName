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
            
            <section className="mt-12 space-y-8 text-zinc-700 dark:text-zinc-300">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                  We collect information that you voluntarily provide to us when you register for an account, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information that we collect depends on the context of your interactions with us and the platform, and may include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Account Data:</strong> We collect your name, email address, and profile picture when you authenticate via Google Login. This information is required to establish your identity as a creator and secure your account.</li>
                  <li><strong>User-Generated Content:</strong> We collect the videos, clips, and associated metadata (such as location, date, and description) that you voluntarily upload and submit to our platform for review and potential licensing.</li>
                  <li><strong>Financial Information:</strong> In order to process payouts for approved and selected content, we may collect necessary payment details securely through our authorized payment processors.</li>
                  <li><strong>Automatically Collected Data:</strong> When you visit, use, or navigate the platform, we automatically collect certain information such as your IP address, browser and device characteristics, operating system, and usage statistics to maintain platform security and operation.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">
                  We use personal information collected via our platform for a variety of business purposes described below:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>To Facilitate Account Creation and Login Process:</strong> If you choose to link your account with us to a third-party account (such as your Google account), we use the information you allowed us to collect from those third parties to facilitate account creation and login process.</li>
                  <li><strong>To Manage User Content:</strong> We use your information to facilitate the secure uploading, storage, tracking, and management of your video submissions.</li>
                  <li><strong>To Process Payouts:</strong> To compensate you for content that has been approved and selected for use by our platform.</li>
                  <li><strong>To Protect Our Services:</strong> We may use your information as part of our efforts to keep our platform safe and secure (for example, for fraud monitoring and prevention).</li>
                  <li><strong>To Communicate With You:</strong> We use your contact information to send you administrative information, account alerts, and updates regarding the status of your video submissions.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">3. Information Sharing and Disclosure</h2>
                <p className="mb-4">
                  We value your privacy and do not sell, rent, or trade your personal information to third parties. We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. This includes sharing data with trusted third-party service providers (such as cloud hosting and payment processors) who are bound by strict confidentiality agreements.
                </p>
                <p>
                  Please note that any videos or content you submit and which are subsequently acquired by LifestudioCanada become subject to the specific licensing agreements associated with that transaction.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">4. Data Retention and Security</h2>
                <p className="mb-4">
                  We implement robust, industry-standard technical and organizational security measures designed to protect the security of any personal information we process. This includes bank-level encryption for sensitive data transfers. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                </p>
                <p>
                  We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">5. Contact Us</h2>
                <p>
                  If you have any questions, concerns, or comments about this Privacy Policy, or if you wish to exercise your data protection rights, please contact us through our official support channels at support@lifestudiocanada.com.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
