'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Camera, UploadCloud, IndianRupee } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: '1. Record Your Life',
    desc: 'Film your morning routine, a cafe visit, or your workout. Authentic, vertical, raw footage.',
  },
  {
    icon: UploadCloud,
    title: '2. Upload Directly',
    desc: 'No apps to download. Just upload your raw video directly through our website.',
  },
  {
    icon: IndianRupee,
    title: '3. Get Paid Cash',
    desc: 'If your video is selected, you get paid transparently and instantly. No barter, real money.',
  },
];

export function HowItWorksSection() {
  const container = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      mm.add('(min-width: 768px)', () => {
        const panels = gsap.utils.toArray('.step-panel') as HTMLElement[];
        const dots = gsap.utils.toArray('.step-dot') as HTMLElement[];

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper.current,
            start: 'top top',
            end: '+=300%',
            pin: true,
            scrub: 1,
          },
          onUpdate: function () {
            const progress = this.progress();
            const stepIndex = Math.min(Math.floor(progress * steps.length), steps.length - 1);
            dots.forEach((dot, i) => {
              if (i === stepIndex) {
                dot.classList.add('bg-zinc-900', 'dark:bg-white', 'scale-150');
                dot.classList.remove('bg-zinc-300', 'dark:bg-zinc-600');
              } else {
                dot.classList.add('bg-zinc-300', 'dark:bg-zinc-600');
                dot.classList.remove('bg-zinc-900', 'dark:bg-white', 'scale-150');
              }
            });
          },
        });

        panels.forEach((panel, i) => {
          if (i === 0) {
            if (reducedMotion) {
              tl.to(panel, { opacity: 0, duration: 1 }, '+=0.5');
            } else {
              tl.to(
                panel,
                { filter: 'blur(8px)', scale: 0.94, opacity: 0, duration: 1, ease: 'power2.in' },
                '+=0.5',
              );
            }
          } else if (i === panels.length - 1) {
            if (reducedMotion) {
              tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.15').to(
                {},
                { duration: 1 },
              );
            } else {
              tl.fromTo(
                panel,
                { filter: 'blur(8px)', scale: 1.04, opacity: 0 },
                { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
                '-=0.15',
              ).to({}, { duration: 1 });
            }
          } else {
            if (reducedMotion) {
              tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.15').to(
                panel,
                {
                  opacity: 0,
                  duration: 1,
                },
                '+=0.5',
              );
            } else {
              tl.fromTo(
                panel,
                { filter: 'blur(8px)', scale: 1.04, opacity: 0 },
                { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
                '-=0.15',
              ).to(
                panel,
                { filter: 'blur(8px)', scale: 0.94, opacity: 0, duration: 1, ease: 'power2.in' },
                '+=0.5',
              );
            }
          }
        });
      });

      mm.add('(max-width: 767px)', () => {
        const scrollTrack = document.querySelector('.how-it-works-track') as HTMLElement;
        if (!scrollTrack) return;
        const dots = gsap.utils.toArray('.step-dot-mobile') as HTMLElement[];
        const panels = gsap.utils.toArray('.step-panel-mobile') as HTMLElement[];

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                const idx = panels.indexOf(entry.target as HTMLElement);
                dots.forEach((dot, i) => {
                  if (i === idx) {
                    dot.classList.add('bg-zinc-900', 'dark:bg-white', 'scale-150');
                    dot.classList.remove('bg-zinc-300', 'dark:bg-zinc-600');
                  } else {
                    dot.classList.add('bg-zinc-300', 'dark:bg-zinc-600');
                    dot.classList.remove('bg-zinc-900', 'dark:bg-white', 'scale-150');
                  }
                });
              }
            });
          },
          {
            root: scrollTrack,
            threshold: 0.5,
          },
        );

        panels.forEach((p) => observer.observe(p));

        dots[0]?.classList.add('bg-zinc-900', 'dark:bg-white', 'scale-150');
        dots[0]?.classList.remove('bg-zinc-300', 'dark:bg-zinc-600');

        return () => observer.disconnect();
      });

      return () => mm.revert();
    },
    { scope: container },
  );

  return (
    <section
      id="how-it-works"
      ref={container}
      className="relative border-t border-zinc-200 bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
    >
      {/* Desktop Version */}
      <div
        ref={wrapper}
        className="relative hidden h-[100svh] w-full flex-col items-center justify-center md:flex"
      >
        <div className="absolute top-16 z-10 w-full px-4 text-center md:top-20">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">How It Works</h2>
        </div>

        <div className="relative mt-12 flex w-full max-w-3xl flex-1 items-center justify-center px-4 md:mt-0">
          <div className="relative block h-[400px] w-full md:h-[300px]">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`step-panel absolute inset-0 flex flex-col items-center justify-center text-center ${
                  i === 0 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm md:mb-8 md:h-24 md:w-24 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
                  <step.icon className="h-10 w-10 text-zinc-900 md:h-12 md:w-12 dark:text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold md:mb-4 md:text-4xl">{step.title}</h3>
                <p className="mx-auto max-w-lg text-lg text-zinc-600 md:text-xl dark:text-zinc-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className="step-dot h-2 w-2 rounded-full bg-zinc-300 transition-all duration-300 dark:bg-zinc-600"
            />
          ))}
        </div>
      </div>

      {/* Mobile Version (Native Horizontal Scroll) */}
      <div className="flex w-full flex-col overflow-hidden py-20 md:hidden">
        <div className="mb-10 w-full px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-4 text-sm font-medium text-zinc-500">Swipe to explore &rarr;</p>
        </div>

        <div className="how-it-works-track hide-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-panel-mobile flex w-[85vw] flex-none snap-center flex-col items-center text-center ${
                i === 0 ? 'ml-[7.5vw]' : ''
              } ${i === steps.length - 1 ? 'mr-[7.5vw]' : ''}`}
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
                <step.icon className="h-10 w-10 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
              <p className="px-4 text-lg text-zinc-600 dark:text-zinc-400">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Progress Dots */}
        <div className="mt-10 flex justify-center gap-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className="step-dot-mobile h-2 w-2 rounded-full bg-zinc-300 transition-all duration-300 dark:bg-zinc-600"
            />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}
