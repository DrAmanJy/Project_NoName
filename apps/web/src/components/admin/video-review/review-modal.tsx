'use client';

import { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertOctagon,
  DollarSign,
  ShieldAlert,
  Send,
  Loader2,
} from 'lucide-react';

export type ReviewActionType = 'APPROVE' | 'REJECT';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    action: ReviewActionType;
    rewardAmount?: number;
    rejectionReason?: string;
    feedbackNotes?: string;
  }) => Promise<void> | void;
  action: ReviewActionType;
  videoTitle: string;
  videoId: string;
  defaultReward?: number;
}

const REJECTION_REASON_PRESETS = [
  'Script Mismatch & Missing Key Phrases',
  'ID Document Held Invalid / Unverifiable',
  'Low Video/Audio Quality or Obscured Face',
  'Inappropriate or Restricted Content',
  'Other Policy Non-Compliance',
];

const POSITIVE_FEEDBACK_TAGS = [
  'High Quality Audio & Video',
  'Document & ID Verified',
  'Full Script Adherence',
  'Clear Voice & Lighting',
];

export function ReviewModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  videoTitle,
  videoId,
  defaultReward = 25.0,
}: ReviewModalProps) {
  const isApprove = action === 'APPROVE';
  const [rewardAmount, setRewardAmount] = useState<number>(defaultReward);
  const [rejectionReason, setRejectionReason] = useState<string>(
    REJECTION_REASON_PRESETS[0] ?? 'Script Mismatch & Missing Key Phrases'
  );
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isApprove) {
        const combinedNotes = [
          ...selectedTags,
          feedbackNotes.trim(),
        ]
          .filter(Boolean)
          .join(' • ');

        await onConfirm({
          action: 'APPROVE',
          rewardAmount: rewardAmount,
          feedbackNotes: combinedNotes || 'Approved by admin review.',
        });
      } else {
        await onConfirm({
          action: 'REJECT',
          rejectionReason: rejectionReason,
          feedbackNotes: feedbackNotes.trim() || rejectionReason,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-2xl transition-all">
        {/* Modal Top Banner Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-5 ${
            isApprove
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-red-500/20 bg-red-500/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                isApprove
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertOctagon className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                {isApprove ? 'Approve Video Submission' : 'Reject Video Submission'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ID: {videoId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Title Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
          <span className="truncate max-w-[320px]">Target: {videoTitle}</span>
          <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">
            {isApprove ? 'Status -> SELECTED' : 'Status -> REJECTED'}
          </span>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {isApprove ? (
            /* APPROVAL FORM */
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Reward Payout Amount ($)
                </label>
                <div className="relative flex items-center">
                  <DollarSign className="absolute left-3.5 h-4 w-4 text-emerald-500 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-4 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  This reward will be allocated directly to the creator&apos;s wallet balance.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Praise & Feedback Presets (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {POSITIVE_FEEDBACK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Additional Note for Creator
                </label>
                <textarea
                  rows={3}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Great work! Video passed all review checks..."
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </>
          ) : (
            /* REJECTION FORM */
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Primary Rejection Reason
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                >
                  {REJECTION_REASON_PRESETS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Detailed Rejection Feedback (Visible to Creator)
                </label>
                <textarea
                  rows={4}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Please specify what needs fixing e.g. 'The ID document was unreadable at timestamp 0:12. Please re-upload with clear lighting.'"
                  required
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-400 leading-relaxed">
                  Rejection will set the video status to <strong>REJECTED</strong> and send an automatic notification email to the creator with your feedback.
                </p>
              </div>
            </>
          )}

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-5 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-950/40'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>
                {isSubmitting
                  ? 'Updating Status...'
                  : isApprove
                    ? `Approve & Pay $${rewardAmount.toFixed(2)}`
                    : 'Confirm Rejection'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
