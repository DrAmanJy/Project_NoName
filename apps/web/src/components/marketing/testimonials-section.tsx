'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, isReducedMotion } from '@/lib/gsap';

const testimonials = [
  {
    name: "Alex M.",
    role: "Creator",
    text: "I sent a 10-second clip of my morning coffee routine. Got paid same day. Incredible.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Sarah K.",
    role: "Creator",
    text: "No editing, no pitching brands. I just live my life, film it, and get cash. Best side hustle.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "David T.",
    role: "Creator",
    text: "I had 200 followers when I started. It really doesn't matter. They just want authentic video.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  }
];
// TODO: replace with real testimonials

export function TestimonialsSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isReducedMotion()) return;

    gsap.fromTo(".test-card", 
      { opacity: 0, y: 30 },
      {
        opacity: 1, 
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 75%",
          onEnter: () => {
            gsap.fromTo(".star-icon", 
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)" }
            );
          }
        }
      }
    );
  }, { scope: container });

  return (
    <section ref={container} id="testimonials" className="py-24 bg-white dark:bg-zinc-950 px-4 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center text-zinc-900 dark:text-zinc-50">Don't Just Take Our Word For It</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="test-card bg-zinc-50 dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none">
              <div className="flex-1 mb-8">
                <div className="flex gap-1 text-zinc-900 dark:text-white mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="star-icon w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">"{t.text}"</p>
              </div>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover grayscale" />
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">{t.name}</p>
                  <p className="text-sm text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
