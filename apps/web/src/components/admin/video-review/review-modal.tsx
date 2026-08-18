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
  ChevronDown,
  Check,
  AlertCircle,
  Edit3,
} from 'lucide-react';

export type ReviewActionType = 'APPROVE' | 'REJECT';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    action: ReviewActionType;
    earning?: number;
    rejectionReason?: string;
    feedbackNotes?: string;
  }) => Promise<void> | void;
  action: ReviewActionType;
  videoTitle: string;
  videoId: string;
  expectedEarning: number;
}

const REJECTION_REASON_PRESETS = [
  'Script Mismatch & Missing Key Phrases',
  'ID Document Held Invalid / Unverifiable',
  'Low Video/Audio Quality or Obscured Face',
  'Inappropriate or Restricted Content',
  'Other Policy Non-Compliance',
];

export function ReviewModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  videoTitle,
  videoId,
  expectedEarning,
}: ReviewModalProps) {
  const isApprove = action === 'APPROVE';
  const [earningInput, setEarningInput] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>(
    REJECTION_REASON_PRESETS[0] ?? 'Script Mismatch & Missing Key Phrases'
  );
  const [customReason, setCustomReason] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isApprove) {
        const earningPaise = Math.round((parseFloat(earningInput) || 0) * 100);
        await onConfirm({
          action: 'APPROVE',
          earning: earningPaise,
          feedbackNotes: 'Approved by admin review.',
        });
      } else {
        const finalReason = rejectionReason === 'Custom' ? customReason.trim() : rejectionReason;
        await onConfirm({
          action: 'REJECT',
          rejectionReason: finalReason,
          feedbackNotes: finalReason,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting the review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-2xl transition-all custom-scrollbar">
        {/* Modal Top Banner Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-5 rounded-t-3xl shrink-0 ${
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
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Title Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center justify-between shrink-0">
          <span className="truncate max-w-[320px]">Target: {videoTitle}</span>
          <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">
            {isApprove ? 'Status -> SELECTED' : 'Status -> REJECTED'}
          </span>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {isApprove ? (
            /* APPROVAL FORM */
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Expected Earning
              </label>
              <div className="relative mb-4 flex items-center">
                <input
                  type="text"
                  value={`$${(expectedEarning / 100).toFixed(2)}`}
                  readOnly
                  className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-100 pr-4 pl-4 text-sm font-bold text-zinc-600 outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
                />
              </div>

              <label className="mb-2 block text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                Actual Earning ($)
              </label>
              <div className="relative flex items-center">
                <DollarSign className="pointer-events-none absolute left-3.5 h-4 w-4 text-emerald-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={expectedEarning / 100}
                  value={earningInput}
                  onChange={(e) => setEarningInput(e.target.value)}
                  required
                  className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pr-4 pl-10 text-sm font-bold text-zinc-900 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-500">
                This reward will be allocated directly to the creator&apos;s wallet balance. Max: ${(expectedEarning / 100).toFixed(2)}.
              </p>
            </div>
          ) : (
            /* REJECTION FORM */
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Primary Rejection Reason
                </label>
                
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-xs font-semibold transition-all outline-none ${
                      isDropdownOpen
                        ? 'border-red-500 ring-2 ring-red-500/20 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="truncate">
                        {rejectionReason === 'Custom' ? 'Custom Reason...' : rejectionReason}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-red-500' : ''
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 p-1.5 shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="space-y-1">
                        {REJECTION_REASON_PRESETS.map((reason) => {
                          const isSelected = rejectionReason === reason;
                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => {
                                setRejectionReason(reason);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                              }`}
                            >
                              <span className="truncate pr-2">{reason}</span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-red-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                        
                        {/* Custom Reason Option */}
                        <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

                        <button
                          type="button"
                          onClick={() => {
                            setRejectionReason('Custom');
                            setIsDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all ${
                            rejectionReason === 'Custom'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Edit3 className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Custom Reason...</span>
                          </div>
                          {rejectionReason === 'Custom' && (
                            <Check className="h-4 w-4 text-red-500 shrink-0" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {rejectionReason === 'Custom' && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Specify Custom Reason
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom rejection reason..."
                    required
                    className="h-11 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all mb-4"
                  />
                </div>
              )}

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
                    ? `Approve & Pay $${(parseFloat(earningInput) || 0).toFixed(2)}`
                    : 'Confirm Rejection'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
