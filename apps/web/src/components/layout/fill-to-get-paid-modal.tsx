'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2, User, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { submitLeadAction } from '@/app/actions/submit-lead';

interface FillToGetPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FillToGetPaidModal({ isOpen, onClose }: FillToGetPaidModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentlyLived, setCurrentlyLived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; currentlyLived?: string }>({});

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset state on open
    setName('');
    setPhone('');
    setCurrentlyLived('');
    setErrors({});
    setSubmitError(null);
    setIsSuccess(false);
    setIsSubmitting(false);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      tl.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' },
        '-=0.15'
      );

      if (iconRef.current) {
        tl.fromTo(
          iconRef.current,
          { scale: 0, rotation: -15 },
          { scale: 1, rotation: 0, duration: 0.45, ease: 'elastic.out(1.1, 0.6)' },
          '-=0.2'
        );
      }

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.25 },
        '-=0.25'
      );

      if (formRef.current) {
        const fields = formRef.current.querySelectorAll('.form-field');
        tl.fromTo(
          fields,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 },
          '-=0.15'
        );
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  const handleClose = () => {
    if (backdropRef.current && modalRef.current) {
      const tl = gsap.timeline({
        onComplete: onClose,
      });

      tl.to(modalRef.current, {
        opacity: 0,
        scale: 0.92,
        y: 15,
        duration: 0.2,
        ease: 'power2.in',
      }).to(backdropRef.current, { opacity: 0, duration: 0.15 }, '-=0.1');
    } else {
      onClose();
    }
  };

  const validate = () => {
    const newErrors: { name?: string; phone?: string; currentlyLived?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!currentlyLived.trim()) {
      newErrors.currentlyLived = 'Currently lived location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitLeadAction({
        name,
        phone,
        currentlyLived,
      });

      if (response.success) {
        setIsSuccess(true);
        // Animate success screen transition
        setTimeout(() => {
          if (successRef.current) {
            gsap.fromTo(
              successRef.current.children,
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out' }
            );
          }
        }, 50);
      } else {
        setSubmitError(response.error || 'Failed to submit details. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm opacity-0 transition-colors"
      onClick={(e) => {
        if (e.target === backdropRef.current) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 p-8 sm:p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 opacity-0 transition-colors duration-300"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Title & Description */}
            <div ref={titleRef} className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                Fill to Get Paid
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Provide your details to submit your information and get verified for instant payouts.
              </p>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-950/60 p-3.5 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 mb-4">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold">{submitError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-200 p-0.5 rounded-md"
                  aria-label="Dismiss error message"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="form-field flex flex-col gap-1.5">
                <label htmlFor="name-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="name-input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50 text-sm font-medium transition-all outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 ${
                      errors.name
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.name}</p>}
              </div>

              {/* Phone Number */}
              <div className="form-field flex flex-col gap-1.5">
                <label htmlFor="phone-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="+1 (416) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50 text-sm font-medium transition-all outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 ${
                      errors.phone
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] font-medium text-red-500 pl-1">{errors.phone}</p>}
              </div>

              {/* Currently Lived */}
              <div className="form-field flex flex-col gap-1.5">
                <label htmlFor="lived-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Currently Lived (Country)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="lived-input"
                    type="text"
                    placeholder="Canada"
                    value={currentlyLived}
                    onChange={(e) => setCurrentlyLived(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50 text-sm font-medium transition-all outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 ${
                      errors.currentlyLived
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white'
                    }`}
                  />
                </div>
                {errors.currentlyLived && (
                  <p className="text-[11px] font-medium text-red-500 pl-1">{errors.currentlyLived}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="form-field mt-4 relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-5 text-sm font-bold text-white dark:text-zinc-900 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying details...</span>
                  </>
                ) : (
                  <span>Submit Details</span>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div ref={successRef} className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Successfully Submitted!
            </h3>
            
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-zinc-900 dark:text-white">{name}</span>. Your details have been submitted. Our team will verify and get in touch with you shortly.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-8 flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
