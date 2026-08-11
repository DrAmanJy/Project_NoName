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
    title: '2. Send via WhatsApp',
    desc: 'No apps to download. Just drop your raw video directly into our WhatsApp chat.',
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
                '+=0.5'
              );
            }
          } else if (i === panels.length - 1) {
            if (reducedMotion) {
              tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.15').to(
                {},
                { duration: 1 }
              );
            } else {
              tl.fromTo(
                panel,
                { filter: 'blur(8px)', scale: 1.04, opacity: 0 },
                { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
                '-=0.15'
              ).to({}, { duration: 1 });
            }
          } else {
            if (reducedMotion) {
              tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.15').to(panel, {
                opacity: 0,
                duration: 1,
              }, '+=0.5');
            } else {
              tl.fromTo(
                panel,
                { filter: 'blur(8px)', scale: 1.04, opacity: 0 },
                { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
                '-=0.15'
              ).to(
                panel,
                { filter: 'blur(8px)', scale: 0.94, opacity: 0, duration: 1, ease: 'power2.in' },
                '+=0.5'
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
          }
        );

        panels.forEach((p) => observer.observe(p));

        dots[0]?.classList.add('bg-zinc-900', 'dark:bg-white', 'scale-150');
        dots[0]?.classList.remove('bg-zinc-300', 'dark:bg-zinc-600');

        return () => observer.disconnect();
      });

      return () => mm.revert();
    },
    { scope: container }
  );

  return (
    <section
      id="how-it-works"
      ref={container}
      className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 relative border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300"
    >
      {/* Desktop Version */}
      <div
        ref={wrapper}
        className="hidden md:flex w-full h-[100svh] flex-col items-center justify-center relative"
      >
        <div className="w-full text-center z-10 px-4 absolute top-16 md:top-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How It Works</h2>
        </div>

        <div className="relative w-full max-w-3xl px-4 flex-1 flex items-center justify-center mt-12 md:mt-0">
          <div className="block w-full h-[400px] md:h-[300px] relative">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`step-panel flex flex-col items-center text-center absolute inset-0 justify-center ${
                  i === 0 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 md:mb-8 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
                  <step.icon className="w-10 h-10 md:w-12 md:h-12 text-zinc-900 dark:text-white" />
                </div>
                <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{step.title}</h3>
                <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-4 z-20">
          {steps.map((_, i) => (
            <div
              key={i}
              className="step-dot w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Mobile Version (Native Horizontal Scroll) */}
      <div className="md:hidden w-full flex flex-col py-20 overflow-hidden">
        <div className="w-full text-center mb-10 px-4">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-zinc-500 mt-4 text-sm font-medium">Swipe to explore &rarr;</p>
        </div>

        <div className="how-it-works-track flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-panel-mobile flex-none w-[85vw] snap-center flex flex-col items-center text-center ${
                i === 0 ? 'ml-[7.5vw]' : ''
              } ${i === steps.length - 1 ? 'mr-[7.5vw]' : ''}`}
            >
              <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
                <step.icon className="w-10 h-10 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 px-4">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile Progress Dots */}
        <div className="flex justify-center gap-3 mt-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className="step-dot-mobile w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 transition-all duration-300"
            />
          ))}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
