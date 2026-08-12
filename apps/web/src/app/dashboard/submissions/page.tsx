import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Submissions',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubmissionsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold tracking-tight">My Submissions</h1>
      <p className="mt-4 text-lg text-foreground/70">
        Manage your submitted videos.
      </p>
      <div className="mt-8">
        <Link 
          href="/dashboard/submissions/create" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          New Submission
        </Link>
      </div>
    </main>
  );
}
