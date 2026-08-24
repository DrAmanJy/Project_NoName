'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, isReducedMotion } from '@/lib/gsap';
import { Video, ThumbsUp, CreditCard } from 'lucide-react';

export function EarningsSection() {
  const container = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    if (isReducedMotion() || !pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      }
    });

    // Payout count animation
    const payoutObj = { min: 0, max: 0 };
    const minEl = document.querySelector('.payout-min');
    const maxEl = document.querySelector('.payout-max');

    gsap.to(payoutObj, {
      min: 50,
      max: 100,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: container.current,
        start: "top 75%",
      },
      onUpdate: () => {
        if (minEl && maxEl) {
          minEl.textContent = Math.round(payoutObj.min).toString();
          maxEl.textContent = Math.round(payoutObj.max).toString();
        }
      }
    });

    gsap.fromTo(".earn-step", 
      { opacity: 0, y: 30 },
      {
        opacity: 1, 
        y: 0,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 60%",
        }
      }
    );

    gsap.fromTo(".earn-icon-container", 
      { scale: 0.8 },
      {
        scale: 1,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: container.current,
          start: "top 60%",
        }
      }
    );

  }, { scope: container });

  return (
    <section ref={container} id="earnings" className="py-32 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-900 dark:text-zinc-50">How Selection & Payment Works</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-20 max-w-2xl mx-auto">
          We keep it simple. If we like your raw footage, we buy it. 
          Average payouts range from <span className="font-bold text-zinc-900 dark:text-white border-b-2 border-green-500">$<span className="payout-min">0</span>-$<span className="payout-max">0</span></span> per video.
        </p>

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0">
          
          {/* Desktop SVG Line connecting steps */}
          <div className="hidden md:block absolute top-12 left-[15%] w-[70%] h-[20px] -z-10">
            <svg width="100%" height="20" className="overflow-visible preserve-3d text-zinc-300 dark:text-zinc-700" preserveAspectRatio="none">
              <path 
                ref={pathRef}
                d="M 0 10 L 1000 10" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round"
                strokeDasharray="6 6"
              />
            </svg>
          </div>

          {/* Steps */}
          <div className="earn-step flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-300">
            <div className="earn-icon-container w-24 h-24 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full flex items-center justify-center mb-6 z-10 border-[12px] border-zinc-50 dark:border-zinc-950 shadow-sm dark:shadow-none">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-zinc-900 dark:text-zinc-50">Upload Video</h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-[200px]">Send your clip via our secure WhatsApp chat.</p>
          </div>

          <div className="earn-step flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-300">
            <div className="earn-icon-container w-24 h-24 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full flex items-center justify-center mb-6 z-10 border-[12px] border-zinc-50 dark:border-zinc-950 shadow-sm dark:shadow-none">
              <ThumbsUp className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-zinc-900 dark:text-zinc-50">We Review</h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-[200px]">Our team checks if it matches our current needs.</p>
          </div>

          <div className="earn-step flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-300">
            <div className="earn-icon-container w-24 h-24 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex items-center justify-center mb-6 z-10 border-[12px] border-zinc-50 dark:border-zinc-950 shadow-lg">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-zinc-900 dark:text-zinc-50">Get Paid</h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-[200px]">Receive funds directly to your bank account.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
