import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about noname and our mission to connect creators with opportunities.',
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <p className="mt-4 text-lg text-foreground/70">
        Learn more about our platform and mission.
      </p>
    </main>
  );
}
