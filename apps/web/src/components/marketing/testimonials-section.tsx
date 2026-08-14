import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I honestly didn't expect much, but Synex completely surprised me. I uploaded a short clip of my morning coffee routine, and within 12 hours, it was selected for a campaign. The payout was instant and directly to my wallet. This is the future of content creation.",
      name: 'Sarah Jenkins',
      role: 'Lifestyle Creator',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      rating: 5,
    },
    {
      quote:
        "What I love most about Synex is the transparency. You know exactly what they're looking for and what you'll get paid. As someone who travels a lot, it's an incredible way to monetize the random beautiful moments I capture on my phone without needing a massive following.",
      name: 'Marcus Chen',
      role: 'Travel Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      rating: 5,
    },
    {
      quote:
        "The submission process is flawless. No complicated forms, just upload and wait for the review. I've had three videos selected this month alone. It's incredibly motivating to see real brands value raw, authentic content over highly produced studio shots.",
      name: 'Elena Rostova',
      role: 'Digital Nomad',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      rating: 5,
    },
    {
      quote:
        "I used to spend hours editing videos for platforms that barely paid anything. With Synex, I just shoot raw, unedited footage of my woodworking projects and get compensated fairly. The direct S3 upload is lightning fast even for my 4K files.",
      name: 'David Okafor',
      role: 'Woodworking Artisan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
      rating: 5,
    },
    {
      quote:
        "As a student, I'm always looking for side hustles. Synex lets me earn by just recording small clips of my study setups and campus life. It literally takes 5 minutes of my day. I've already withdrawn enough to cover my textbooks for the semester!",
      name: 'Priya Sharma',
      role: 'Student & Vlogger',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      rating: 5,
    },
    {
      quote:
        "The push notifications are a game changer. I uploaded a video while walking my dog, and by the time I got home, my phone buzzed telling me it was approved and paid. The platform is sleek, professional, and treats creators with genuine respect.",
      name: 'James Wilson',
      role: 'Pet Creator',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop',
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
