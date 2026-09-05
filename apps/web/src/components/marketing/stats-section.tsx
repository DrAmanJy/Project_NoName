'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, isReducedMotion } from '@/lib/gsap';
import { Calendar, Film, DollarSign, Users } from 'lucide-react';

interface StatItem {
  icon: typeof Calendar;
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  decimals?: number;
  raw?: boolean;
}

const stats: StatItem[] = [
  {
    icon: Calendar,
    value: 2019,
    suffix: '',
    label: 'Founded',
    decimals: 0,
    raw: true,
  },
  {
    icon: Film,
    value: 50000,
    suffix: '+',
    label: 'Videos Purchased',
    decimals: 0,
  },
  {
    icon: DollarSign,
    value: 2.5,
    prefix: '$',
    suffix: 'M+',
    label: 'Paid to Creators',
    decimals: 1,
  },
  {
    icon: Users,
    value: 15000,
    suffix: '+',
    label: 'Active Creators',
    decimals: 0,
  },
];

function formatNumber(num: number, decimals: number, raw?: boolean): string {
  if (decimals > 0) {
    return num.toFixed(decimals);
  }
  if (raw) {
    return Math.round(num).toString();
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function StatsSection() {
  const container = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const reduced = isReducedMotion();

      // Animate each stat number counting up
      stats.forEach((stat, i) => {
        const el = valueRefs.current[i];
        if (!el) return;

        if (reduced) {
          el.textContent = `${stat.prefix ?? ''}${formatNumber(stat.value, stat.decimals ?? 0, stat.raw)}${stat.suffix}`;
          return;
        }

        const counter = { val: 0 };

        gsap.to(counter, {
          val: stat.value,
          duration: 2.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container.current,
            start: 'top 80%',
          },
          onUpdate: () => {
            el.textContent = `${stat.prefix ?? ''}${formatNumber(counter.val, stat.decimals ?? 0, stat.raw)}${stat.suffix}`;
          },
        });
      });

      // Stagger the cards in
      if (!reduced) {
        gsap.fromTo(
          '.stat-card',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container.current,
              start: 'top 80%',
            },
          },
        );
      }
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="relative overflow-hidden border-t border-zinc-200 bg-white py-20 transition-colors duration-300 md:py-24 dark:border-zinc-900 dark:bg-black"
    >
      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center md:mb-16">
          <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
            Our track record
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Built on trust, powered by creators
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
            Since day one, we&apos;ve been committed to fair pay, fast reviews, and genuine
            partnerships with creators across Canada.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="stat-card group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg hover:shadow-black/5 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:shadow-white/5"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors duration-300 group-hover:bg-zinc-900 group-hover:text-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
                  <Icon className="h-6 w-6" />
                </div>
                <span
                  ref={(el) => {
                    valueRefs.current[i] = el;
                  }}
                  className="block text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-white"
                >
                  {stat.prefix ?? ''}0{stat.suffix}
                </span>
                <span className="mt-2 block text-xs font-semibold tracking-wider text-zinc-500 uppercase sm:text-sm dark:text-zinc-400">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
