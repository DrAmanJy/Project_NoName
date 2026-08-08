import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Discover how to upload videos, get selected, and earn money on noname.',
};

export default function HowItWorksPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">How It Works</h1>
      <p className="mt-4 text-lg text-foreground/70">
        Upload, get reviewed, earn. It&apos;s that simple.
      </p>
    </main>
  );
}
