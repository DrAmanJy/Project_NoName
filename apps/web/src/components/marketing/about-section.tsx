import { Upload, ThumbsUp, Gift } from 'lucide-react';

export function AboutSection() {
  const features = [
    {
      icon: Upload,
      title: 'Easy Video Upload',
      description:
        'Upload your experience videos in seconds with our intuitive interface. Drag, drop, and you are done — no technical skills needed.',
    },
    {
      icon: ThumbsUp,
      title: 'Quick Review Process',
      description:
        'Our team reviews every submission promptly and fairly. Most videos are approved within 24 hours, so you get rewarded fast.',
    },
    {
      icon: Gift,
      title: 'Earn Rewards',
      description:
        'Every approved video earns real rewards. The more authentic experiences you share, the more you earn. Simple and transparent.',
    },
  ];

  return (
    <section
      id="about"
      className="bg-white dark:bg-black py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-50 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            WHY CHOOSE TRUE SERVICES
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Built for creators, designed for simplicity
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Turn your everyday moments into real money with zero friction.
          </p>
        </div>

        {/* Feature Cards Grid (Black & White Theme) */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md"
              >
                {/* Icon badge */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm transition-colors group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
