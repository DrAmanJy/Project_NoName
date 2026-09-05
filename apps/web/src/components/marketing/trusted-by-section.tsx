import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

const partners = [
  { name: 'Bell Media', desc: 'Media Partner' },
  { name: 'CBC', desc: 'Broadcasting' },
  { name: 'Shopify', desc: 'Commerce' },
  { name: 'Lululemon', desc: 'Lifestyle' },
  { name: 'Tim Hortons', desc: 'Brand Partner' },
  { name: 'Air Canada', desc: 'Travel' },
  { name: 'Canadian Tire', desc: 'Retail' },
  { name: 'Rogers Media', desc: 'Media Partner' },
];

// Duplicate for seamless loop
const marqueeItems = [...partners, ...partners];

const trustBadges = [
  { icon: ShieldCheck, label: '256-bit SSL Encrypted' },
  { icon: Lock, label: 'PIPEDA Compliant' },
  { icon: CreditCard, label: 'Secure Payments' },
];

export function TrustedBySection() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-200 bg-zinc-50/50 py-12 transition-colors duration-300 dark:border-zinc-900 dark:bg-zinc-950/50 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
          Powered by industry-leading technology
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-zinc-50/90 to-transparent dark:from-zinc-950/90 sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-zinc-50/90 to-transparent dark:from-zinc-950/90 sm:w-32" />

        {/* Scrolling track */}
        <div className="marquee-track flex w-max items-center gap-10 sm:gap-14">
          {marqueeItems.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="group flex shrink-0 flex-col items-center justify-center gap-1 px-2"
            >
              <span className="whitespace-nowrap text-lg font-black tracking-tight text-zinc-300 transition-all duration-300 group-hover:text-zinc-900 sm:text-xl dark:text-zinc-700 dark:group-hover:text-white">
                {partner.name}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-300 transition-colors duration-300 group-hover:text-zinc-500 dark:text-zinc-700 dark:group-hover:text-zinc-400">
                {partner.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-6 px-4 sm:gap-8">
        {trustBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500"
            >
              <Icon className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .marquee-track {
              animation: marquee-scroll 35s linear infinite;
            }
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .marquee-track {
                animation: none;
              }
            }
          `,
        }}
      />
    </section>
  );
}
