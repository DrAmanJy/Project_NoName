import Link from 'next/link';
import { Video, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Info */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Synax<span className="text-zinc-500">.</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              Turn your authentic moments into real rewards. Upload videos, track reviews, and earn rewards effortlessly.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-300">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Creator Ecosystem</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Platform</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#about" className="hover:text-zinc-900 dark:hover:text-white">About Synax</a></li>
                <li><a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-white">How It Works</a></li>
                <li><a href="#upload" className="hover:text-zinc-900 dark:hover:text-white">Upload Video</a></li>
                <li><a href="#testimonials" className="hover:text-zinc-900 dark:hover:text-white">Creator Reviews</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Apps & Mobile</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#download" className="hover:text-zinc-900 dark:hover:text-white">iOS App Store</a></li>
                <li><a href="#download" className="hover:text-zinc-900 dark:hover:text-white">Google Play Store</a></li>
                <li><a href="#download" className="hover:text-zinc-900 dark:hover:text-white">Scan QR Code</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Support & Legal</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#contact" className="hover:text-zinc-900 dark:hover:text-white">Help & Contact</a></li>
                <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-white">Trust & Security</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-200 dark:border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Synax Platform. All rights reserved.</p>
          <div className="flex gap-6 font-medium">
            <a href="#about" className="hover:text-zinc-900 dark:hover:text-white">Privacy</a>
            <a href="#about" className="hover:text-zinc-900 dark:hover:text-white">Terms</a>
            <a href="#contact" className="hover:text-zinc-900 dark:hover:text-white">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
