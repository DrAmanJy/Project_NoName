import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the noname team. We are here to help.',
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mt-4 text-lg text-foreground/70">
        Have questions? Reach out to us.
      </p>
    </main>
  );
}
