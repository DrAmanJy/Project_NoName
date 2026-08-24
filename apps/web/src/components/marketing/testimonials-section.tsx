import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "As a beauty UGC creator, I used to wait weeks to get paid by traditional agencies. On LifestudioCanada, I uploaded a 30-second unboxing video directly from my phone. Within 8 hours, it went from 'UNDER_REVIEW' to 'PAID' directly into my account. The sheer speed is unbelievable.",
      name: 'Sophia Al-Mansoor',
      role: 'UGC Beauty Creator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
      rating: 5,
    },
    {
      quote:
        "The direct presigned R2 upload is super smooth even for heavy 4K 60fps clips. I love being able to track every step of my submission status in real-time on the creator dashboard. No middleman, just raw video assets for real reward payouts.",
      name: 'Alexey Morozov',
      role: 'Tech & Gear Reviewer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250',
      rating: 5,
    },
    {
      quote:
        "I submitted 4 workout demonstration videos last week. Three were selected and paid out within 24 hours. The platform gives crystal clear guidelines on what brands need, making it incredibly straightforward to create winning clips.",
      name: 'Jessica Taylor',
      role: 'Fitness & Wellness Creator',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250',
      rating: 5,
    },
    {
      quote:
        "LifestudioCanada completely changed how I monetize my B-roll footage. I uploaded raw clips from my weekend hike in Oregon, and earned $150 before Monday morning. It’s the simplest way for videographers to get paid for authentic raw content.",
      name: "Liam O'Connor",
      role: 'Outdoor Filmmaker',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250',
      rating: 5,
    },
    {
      quote:
        "What sets LifestudioCanada apart is total transparency. You see your upload progress, review stage, and instant payout status right on your dashboard. I’ve already recommended LifestudioCanada to all my fellow food content creators.",
      name: 'Amina Diallo',
      role: 'Culinary Content Creator',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250&h=250',
      rating: 5,
    },
    {
      quote:
        "I was skeptical at first, but after receiving my first payout straight to my wallet, I was hooked. No subscriber threshold required—just submit good, authentic videos and get rewarded.",
      name: 'Mateo Hernandez',
      role: 'Lifestyle & Streetwear Creator',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250&h=250',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="bg-white dark:bg-black py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            COMMUNITY REVIEWS
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Loved by real creators worldwide
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Hear from people turning their daily video moments into steady rewards.
          </p>
        </div>

        {/* Testimonials Marquee */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
        <div className="mt-16 overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex gap-8 w-max animate-marquee">
            {[...Array(2)].map((_, groupIndex) => (
              <div key={groupIndex} className="flex gap-8 w-max">
                {testimonials.map((item, idx) => (
                  <div
                    key={`${groupIndex}-${idx}`}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-600 w-[300px] sm:w-[380px] shrink-0"
                  >
                    <div>
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>

                      {/* Quote Text */}
                      <div className="relative mt-6">
                        <Quote className="absolute -top-3 -left-2 h-8 w-8 text-zinc-200 dark:text-zinc-800 -z-0" />
                        <p className="relative z-10 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal italic">
                          "{item.quote}"
                        </p>
                      </div>
                    </div>

                    {/* Author Row */}
                    <div className="mt-8 flex items-center gap-3 border-t border-zinc-200 dark:border-zinc-900 pt-6">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
