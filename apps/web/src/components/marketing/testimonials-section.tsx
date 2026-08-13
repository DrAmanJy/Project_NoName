import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'I uploaded a 15-second coffee brewing clip and earned $25 within 24 hours. The process is amazingly simple and direct.',
      name: 'Sarah Jenkins',
      role: 'Lifestyle Creator',
      avatar: 'SJ',
      rating: 5,
    },
    {
      quote:
        'Finally a platform where I do not need millions of followers to monetize my videos. Synex pays for quality authentic moments.',
      name: 'Marcus Chen',
      role: 'Travel Enthusiast',
      avatar: 'MC',
      rating: 5,
    },
    {
      quote:
        'Super transparent payouts directly to my wallet. Submitting videos takes less than a minute. Highly recommend to everyone!',
      name: 'Elena Rostova',
      role: 'Digital Nomad',
      avatar: 'ER',
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

        {/* Testimonials Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold shadow-sm">
                  {item.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
