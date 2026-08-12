import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Submission Detail',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">Submission Detail</h1>
      <p className="mt-4 text-lg text-foreground/70">
        ID: {resolvedParams.id}
      </p>
      <div className="mt-8">
        <Link 
          href="/dashboard/submissions" 
          className="text-blue-600 hover:underline transition"
        >
          Back to Submissions
        </Link>
      </div>
    </main>
  );
}
