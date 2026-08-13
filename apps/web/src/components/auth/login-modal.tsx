'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, X, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { API_URL } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function LoginModal({ isOpen = true, onClose }: LoginModalProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated && !isLoading) {
      if (role === 'employee') {
        router.push('/employees/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isOpen, isAuthenticated, isLoading, role, router]);

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35 }
      );

      tl.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.3)' },
        '-=0.2'
      );

      tl.fromTo(
        iconRef.current,
        { scale: 0, rotation: -20 },
        { scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1.1, 0.5)' },
        '-=0.25'
      );

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.3 },
        '-=0.3'
      );

      if (buttonsRef.current) {
        const buttons = buttonsRef.current.children;
        tl.fromTo(
          buttons,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 },
          '-=0.2'
        );
      }

      tl.fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        '-=0.15'
      );
    });

    return () => ctx.revert();
  }, [isOpen]);

  const handleClose = () => {
    if (backdropRef.current && modalRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onClose) {
            onClose();
          } else {
            router.push('/');
          }
        },
      });

      tl.to(modalRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
      }).to(backdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.15');
    } else if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    setLoadingProvider(provider);
    const endpoint = `${API_URL}/auth/${provider}?client=web`;

    // Initiate OAuth through browser navigation, NOT fetch, to avoid CORS failure
    window.location.assign(endpoint);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm opacity-0 transition-colors"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 p-8 sm:p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 opacity-0 transition-colors duration-300"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors"
          aria-label="Close login dialog"
          id="close-login-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div
          ref={iconRef}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white mb-6 border border-zinc-200 dark:border-zinc-800 shadow-inner"
        >
          <ShieldCheck className="h-7 w-7" />
        </div>

        {/* Title & Description */}
        <div ref={titleRef} className="text-center opacity-0">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Sign in to continue
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Choose a method to sign in and start earning rewards for your videos.
          </p>
        </div>

        {/* Social Login Buttons Container */}
        <div ref={buttonsRef} className="mt-8 flex flex-col gap-3.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loadingProvider !== null}
            className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 text-sm font-semibold text-zinc-800 dark:text-zinc-100 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60"
            id="login-google-btn"
          >
            {loadingProvider === 'google' ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-600 dark:text-zinc-300" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            disabled={loadingProvider !== null}
            className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#1877F2] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#166FE5] active:scale-[0.99] disabled:opacity-60"
            id="login-facebook-btn"
          >
            {loadingProvider === 'facebook' ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Continue with Facebook</span>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            disabled={loadingProvider !== null}
            className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 text-sm font-semibold shadow-sm transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-60"
            id="login-apple-btn"
          >
            {loadingProvider === 'apple' ? (
              <Loader2 className="h-5 w-5 animate-spin text-white dark:text-zinc-900" />
            ) : (
              <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-91.9-61.7-91.9zM258.6 94.6c21.8-25.9 36.4-62.1 31.8-98.6-31.4 1.5-68.8 20.7-90.6 46.4-19.1 22.3-35.6 58.7-30.4 94.4 34.6 2.5 70-16.3 89.2-42.2z" />
              </svg>
            )}
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Footer Terms & Security Note */}
        <div ref={footerRef} className="mt-8 text-center border-t border-zinc-200 dark:border-zinc-900 pt-4 opacity-0">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            By signing in, you agree to our{' '}
            <Link href="#" className="underline hover:text-zinc-900 dark:hover:text-white">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="underline hover:text-zinc-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            .<br />
            Your data is protected with bank-level encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
