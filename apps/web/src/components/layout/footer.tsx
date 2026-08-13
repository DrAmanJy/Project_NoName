import Link from 'next/link';
import { ShieldCheck, Download, Smartphone, Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8">
          {/* Brand Info */}
          <div className="md:max-w-md">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/synex_logo.png" alt="Synex Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300" />
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                Synex<span className="text-zinc-400">.</span>
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

          {/* Apps & Mobile - App Store style buttons */}
          <div className="flex flex-col items-start md:items-end mt-4 md:mt-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Get The App</h3>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <a 
                href="#download" 
                className="flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md group border border-transparent dark:border-zinc-200"
              >
                <Smartphone className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-medium leading-none opacity-80 mb-0.5">Download on the</span>
                  <span className="text-sm font-bold leading-none tracking-tight">App Store</span>
                </div>
              </a>
              <a 
                href="#download" 
                className="flex items-center gap-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-5 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800 group"
              >
                <Download className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-medium leading-none text-zinc-500 dark:text-zinc-400 mb-0.5">GET IT ON</span>
                  <span className="text-sm font-bold leading-none tracking-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-zinc-200 dark:border-zinc-800/80">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            © {new Date().getFullYear()} Synex Platform. All rights reserved.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4 text-zinc-400">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-4 w-4" />
              </a>
            </div>

            <div className="hidden sm:block h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>

            {/* Legal Links */}
            <div className="flex gap-6 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <a href="#privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms</a>
              <a href="#contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
