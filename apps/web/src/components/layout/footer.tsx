import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8">
          {/* Brand Info */}
          <div className="md:max-w-md">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="LifestudioCanada Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                LifestudioCanada<span className="text-zinc-400">.</span>
              </span>
            </Link>
            <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The premier platform for creators. Turn your authentic moments into real rewards. Upload videos, track reviews, and earn effortlessly in a verified ecosystem.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-900/50 w-fit px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Verified Creator Ecosystem</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-zinc-200 dark:border-zinc-800/80">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            © {new Date().getFullYear()} LifestudioCanada Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
