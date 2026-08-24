'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const categories = [
  {
    title: 'Tokyo',
    video: 'https://res.cloudinary.com/ddhjov3eb/video/upload/v1785148134/1_p5bj7n.mp4',
  },
  {
    title: 'Sydney',
    video: 'https://res.cloudinary.com/ddhjov3eb/video/upload/v1785148134/6_wjn6hm.mp4',
  },
  {
    title: 'London',
    video: 'https://res.cloudinary.com/ddhjov3eb/video/upload/v1785148135/2_y4aubj.mp4',
  },
  {
    title: 'Toronto',
    video: 'https://res.cloudinary.com/ddhjov3eb/video/upload/v1785148172/3_qskps0.mp4',
  },
  {
    title: 'Amsterdam',
    video: 'https://res.cloudinary.com/ddhjov3eb/video/upload/v1785148135/5_mjsowo.mp4',
  },
  {
    title: 'Toronto',
    video: 'https://res.cloudinary.com/ddhjov3eb/video/upload/v1785148135/4_taiwvp.mp4',
  },
];

export function VideoCategoriesSection() {
  const container = useRef<HTMLDivElement>(null);
  const scrollTrack = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      let mm = gsap.matchMedia();
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Nudge hint
      let nudgePlayed = false;
      ScrollTrigger.create({
        trigger: container.current,
        start: 'top 60%',
        onEnter: () => {
          if (!nudgePlayed && !reducedMotion) {
            nudgePlayed = true;
            gsap.fromTo(
              scrollTrack.current,
              { x: 20 },
              { x: 0, duration: 1, ease: 'elastic.out(1, 0.4)' },
            );
            gsap.to('.swipe-hint', { opacity: 0, delay: 1.5, duration: 0.5 });
          } else if (reducedMotion && !nudgePlayed) {
            nudgePlayed = true;
            gsap.to('.swipe-hint', { opacity: 0, delay: 1.5, duration: 0.5 });
          }
        },
      });

      mm.add('(min-width: 768px)', () => {
        const track = scrollTrack.current;
        if (!track) return;
        const sections = gsap.utils.toArray('.category-card') as HTMLElement[];
        const dots = gsap.utils.toArray('.cat-dot') as HTMLElement[];

        const horizontalTween = gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: container.current,
            pin: true,
            scrub: 1,
            end: () => '+=' + track.offsetWidth,
            onUpdate: function (self) {
              const progress = self.progress;
              const floatIndex = progress * (sections.length - 1);
              const stepIndex = Math.round(floatIndex);

              dots.forEach((dot, i) => {
                if (i === stepIndex) {
                  dot.classList.add('bg-zinc-900', 'dark:bg-white', 'scale-150');
                  dot.classList.remove('bg-zinc-300', 'dark:bg-zinc-600');
                } else {
                  dot.classList.add('bg-zinc-300', 'dark:bg-zinc-600');
                  dot.classList.remove('bg-zinc-900', 'dark:bg-white', 'scale-150');
                }
              });

              if (!reducedMotion) {
                sections.forEach((section: any, i: number) => {
                  const distance = Math.abs(floatIndex - i);
                  let activeProgress = 1 - distance;
                  activeProgress = Math.max(0, Math.min(1, activeProgress));

                  const easeProgress = gsap.parseEase('power1.inOut')(activeProgress);

                  const scale = 0.94 + 0.14 * easeProgress; // 0.94 to 1.08
                  const saturate = 0.6 + 0.4 * easeProgress; // 0.6 to 1
                  const brightness = 0.8 + 0.2 * easeProgress; // 0.8 to 1

                  gsap.set(section.querySelector('.inner-img'), {
                    scale: scale,
                    filter: `saturate(${saturate}) brightness(${brightness})`,
                  });
                });
              }
            },
          },
        });

        if (reducedMotion) {
          sections.forEach((s: any) => {
            gsap.set(s.querySelector('.inner-img'), { scale: 1, filter: 'none' });
          });
        }

        const handleEnter = function (this: HTMLElement) {
          const video = this.querySelector('video');
          if (video) video.play().catch(() => {});
        };

        const handleLeave = function (this: HTMLElement) {
          const video = this.querySelector('video');
          if (video) video.pause();
        };

        sections.forEach((s) => {
          const video = s.querySelector('video');
          if (video) {
            video.pause();
          }
          s.addEventListener('mouseenter', handleEnter);
          s.addEventListener('mouseleave', handleLeave);
        });

        return () => {
          sections.forEach((s) => {
            s.removeEventListener('mouseenter', handleEnter);
            s.removeEventListener('mouseleave', handleLeave);
          });
        };
      });

      mm.add('(max-width: 767px)', () => {
        const dots = gsap.utils.toArray('.cat-dot') as HTMLElement[];
        const sections = gsap.utils.toArray('.category-card') as HTMLElement[];

        if (!reducedMotion) {
          sections.forEach((s: any) => {
            gsap.set(s.querySelector('.inner-img'), {
              scale: 0.94,
              filter: 'saturate(0.6) brightness(0.8)',
            });
          });
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                const idx = sections.indexOf(entry.target as HTMLElement);
                dots.forEach((dot, i) => {
                  if (i === idx) {
                    dot.classList.add('bg-zinc-900', 'dark:bg-white', 'scale-150');
                    dot.classList.remove('bg-zinc-300', 'dark:bg-zinc-600');
                  } else {
                    dot.classList.add('bg-zinc-300', 'dark:bg-zinc-600');
                    dot.classList.remove('bg-zinc-900', 'dark:bg-white', 'scale-150');
                  }
                });

                sections.forEach((s: any, i: number) => {
                  const video = s.querySelector('video');
                  if (video) {
                    if (i === idx) {
                      video.play().catch(() => {});
                    } else {
                      video.pause();
                    }
                  }
                });

                if (!reducedMotion) {
                  sections.forEach((s: any, i: number) => {
                    const img = s.querySelector('.inner-img');
                    if (img) {
                      if (i === idx) {
                        gsap.to(img, {
                          scale: 1.08,
                          filter: 'saturate(1) brightness(1)',
                          duration: 0.4,
                          ease: 'power2.out',
                          overwrite: 'auto',
                        });
                      } else {
                        gsap.to(img, {
                          scale: 0.94,
                          filter: 'saturate(0.6) brightness(0.8)',
                          duration: 0.4,
                          ease: 'power2.out',
                          overwrite: 'auto',
                        });
                      }
                    }
                  });
                }
              }
            });
          },
          {
            root: scrollTrack.current,
            threshold: 0.5,
          },
        );

        sections.forEach((s: any) => {
          const video = s.querySelector('video');
          if (video) video.pause(); // Ensure initially paused
          observer.observe(s);
        });

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
      ref={container}
      className="relative flex flex-col justify-center bg-white py-20 text-zinc-900 transition-colors duration-300 md:h-screen md:overflow-hidden md:py-0 dark:bg-black dark:text-white"
    >
      <div className="pointer-events-none z-10 mb-10 flex w-full justify-center px-4 md:absolute md:top-16 md:left-0 md:mb-0 md:text-center">
        <div className="inline-block rounded-3xl border border-white/60 bg-white/70 px-6 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl md:px-10 md:py-8">
          <h2 className="text-3xl leading-tight font-bold tracking-tight text-zinc-900 md:text-5xl">
            What We're Looking For
          </h2>
          <p className="mt-3 max-w-2xl text-base font-medium text-zinc-700 md:mx-auto md:text-lg">
            We buy authentic, relatable content across these everyday categories.
          </p>
          {/* <p className="swipe-hint mt-3 text-sm font-semibold text-zinc-500">
            <span className="md:hidden">Swipe to explore &rarr;</span>
            <span className="hidden md:inline">Scroll to explore &rarr;</span>
          </p> */}
        </div>
      </div>

      {/* Mobile: Native horizontal scroll. Desktop: GSAP horizontal pin */}
      <div
        ref={scrollTrack}
        className="video-categories-track hide-scrollbar flex w-full snap-x snap-mandatory items-center overflow-x-auto overflow-y-hidden md:-mt-8 md:overflow-visible"
      >
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`category-card aspect-[9/16] w-[80vw] flex-none snap-center p-[10px] md:aspect-auto md:h-[500px] md:w-[400px] md:p-4 ${
              i === 0 ? 'ml-[10vw] md:ml-0' : ''
            } ${i === categories.length - 1 ? 'mr-[10vw] md:mr-0' : ''}`}
          >
            <div className="inner-img group relative h-full w-full overflow-hidden rounded-2xl will-change-[transform,filter]">
              <div className="absolute inset-0 z-10 bg-black/20 transition-colors group-hover:bg-black/0" />
              <div
                className="pointer-events-none absolute inset-0 z-10 opacity-80"
                style={{
                  backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 50%)',
                }}
              />
              <video
                src={cat.video}
                loop
                muted
                playsInline
                className="pointer-events-none h-full w-full object-cover"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <h3 className="text-3xl font-bold text-white drop-shadow-md">{cat.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Dots */}
      <div className="pointer-events-none z-20 mt-6 flex justify-center gap-3 md:absolute md:bottom-12 md:left-1/2 md:-translate-x-1/2">
        {categories.map((_, i) => (
          <div
            key={i}
            className="cat-dot h-2 w-2 rounded-full bg-zinc-300 transition-all duration-300 dark:bg-zinc-600"
          />
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (min-width: 768px) {
          .video-categories-track {
            padding-left: max(1rem, calc((100vw - 1200px) / 2));
          }
        }
      `,
        }}
      />
    </section>
  );
}
