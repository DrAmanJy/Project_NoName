'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, isReducedMotion } from '@/lib/gsap';
import SplitType from 'split-type';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  const container = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const dotGridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!headlineRef.current || !subheadRef.current || !arrowRef.current || !bgRef.current) return;

    const reduced = isReducedMotion();

    // Background parallax
    if (!reduced) {
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Split text animation
    const text = new SplitType(headlineRef.current, { types: 'words,chars' });

    const tl = gsap.timeline();

    tl.from(text.chars, {
      opacity: 0,
      y: reduced ? 0 : 40,
      duration: 0.8,
      stagger: 0.02,
      ease: 'power3.out',
    })
      .from(
        subheadRef.current,
        {
          opacity: 0,
          y: reduced ? 0 : 20,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.4'
      )
      .from(
        arrowRef.current,
        {
          opacity: 0,
          duration: 0.5,
        },
        '-=0.2'
      );

    if (!reduced) {
      gsap.to(arrowRef.current, {
        y: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: 1.5,
      });
    }

    return () => {
      text.revert();
    };
  }, { scope: container });

  // Mousemove wave parallax & dot-grid hover spotlight
  useGSAP(() => {
    const reduced = isReducedMotion();
    if (!reduced) {
      const isHoverSupport = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (isHoverSupport && container.current && dotGridRef.current) {
        const targetContainer = container.current;
        const targetDotGrid = dotGridRef.current;

        // Initial fallback center position
        const rect = targetContainer.getBoundingClientRect();
        targetContainer.style.setProperty('--mx', `${rect.width / 2}px`);
        targetContainer.style.setProperty('--my', `${rect.height / 2}px`);
        targetDotGrid.style.setProperty('--mx', `${rect.width / 2}px`);
        targetDotGrid.style.setProperty('--my', `${rect.height / 2}px`);

        const handleMouseMove = (e: MouseEvent) => {
          const r = targetContainer.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          targetContainer.style.setProperty('--mx', `${x}px`);
          targetContainer.style.setProperty('--my', `${y}px`);
          targetDotGrid.style.setProperty('--mx', `${x}px`);
          targetDotGrid.style.setProperty('--my', `${y}px`);

          // Wave parallax effect
          const moveX = (x / r.width - 0.5) * -15;
          const moveY = (y / r.height - 0.5) * -15;

          gsap.to(targetDotGrid, {
            backgroundPosition: `${moveX}px ${moveY}px`,
            duration: 0.8,
            ease: 'power2.out',
          });
        };

        targetContainer.addEventListener('mousemove', handleMouseMove);
        return () => {
          targetContainer.removeEventListener('mousemove', handleMouseMove);
        };
      }
    }
  }, { scope: container });

  return (
    <section
      ref={container}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-white"
    >
      {/* Background Image with Parallax */}
      <div ref={bgRef} className="absolute inset-0 -z-10 h-[130%] w-full">
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop"
          alt="Lifestyle"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="dot-grid-base" />
      <div className="hero-spotlight" />
      <div ref={dotGridRef} className="dot-grid-hover" />

      <div className="z-20 text-center px-4 max-w-4xl mx-auto mt-20">
        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 120%, 0% 120%)' }}
        >
          Your Life Is Already Content. Get Paid For It.
        </h1>
        <p
          ref={subheadRef}
          className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-medium"
        >
          Upload short lifestyle videos. No followers needed. No editing required. Just real
          moments, rewarded with real cash.
        </p>
      </div>

      <div ref={arrowRef} className="absolute bottom-10 z-20 text-zinc-500 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
        <ChevronDown className="w-10 h-10" />
      </div>
    </section>
  );
}
