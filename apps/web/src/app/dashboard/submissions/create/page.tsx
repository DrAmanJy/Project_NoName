import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'New Submission',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateSubmissionPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">Create Submission</h1>
      <p className="mt-4 text-lg text-foreground/70">
        Upload your video to start a new submission.
      </p>
      <div className="mt-8">
        <Link 
          href="/dashboard/submissions" 
          className="text-blue-600 hover:underline transition"
        >
          Cancel
        </Link>
      </div>
    </main>
  );
}
