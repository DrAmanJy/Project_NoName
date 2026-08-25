import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-zinc-200 bg-zinc-50/50 text-zinc-900 transition-colors duration-300 dark:border-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-800" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:gap-8">
          {/* Brand Info */}
          <div className="md:max-w-md">
            <Link href="/" className="group flex items-center gap-3">
              <img
                src="/logo.png"
                alt="LifestudioCanada Logo"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                LifestudioCanada<span className="text-zinc-400">.</span>
              </span>
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              The premier platform for creators. Turn your authentic moments into real rewards.
              Upload videos, track reviews, and earn effortlessly in a verified ecosystem.
            </p>
          </div>

          {/* Privacy Box */}
          <div className="flex h-fit items-start gap-3 rounded-xl border border-zinc-200/50 bg-zinc-100/50 p-4 md:max-w-sm dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-zinc-900 dark:text-white" />
            <div>
              <h3 className="mb-1 text-xs font-bold text-zinc-900 dark:text-white">
                Data Privacy & Security
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                We only request essential data to authenticate your identity and process payouts. We never sell your personal data.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-zinc-200 pt-8 md:flex-row dark:border-zinc-800/80">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} LifestudioCanada Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Privacy Policy
            </Link>
            <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
            <Link
              href="/terms"
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
