import { Smartphone, QrCode, Shield, Zap, BellRing } from 'lucide-react';

export function AppDownloadSection() {
  return (
    <section
      id="download"
      className="bg-white dark:bg-black py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-50 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-50 dark:bg-zinc-950 p-8 sm:p-12 lg:p-16 text-zinc-900 dark:text-white shadow-xl dark:shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
          {/* Background ambient lighting */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-zinc-200/50 dark:bg-zinc-700/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-zinc-200/50 dark:bg-zinc-700/20 blur-3xl"
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-200/80 dark:bg-white/10 px-3.5 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-300 backdrop-blur-md mb-6 border border-zinc-300/50 dark:border-white/10">
                <Smartphone className="h-4 w-4 text-zinc-900 dark:text-white" />
                <span>Available for iOS & Android</span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl leading-tight">
                Create & earn on the go with the True Services app
              </h2>

              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300 sm:text-lg leading-relaxed max-w-xl">
                Record videos directly, receive real-time review status updates, and withdraw your
                earnings directly to your bank account or crypto wallet.
              </p>

              {/* Mobile Features checklist */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-zinc-900 dark:text-white" />
                  <span>Instant Camera Upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-zinc-900 dark:text-white" />
                  <span>Push Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-zinc-900 dark:text-white" />
                  <span>Secure Wallet Payouts</span>
                </div>
              </div>

              {/* Store Download Buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                {/* Apple App Store */}
                <a
                  href="#download"
                  className="flex items-center gap-3 rounded-2xl bg-zinc-900 dark:bg-white px-5 py-3 text-white dark:text-zinc-900 shadow-lg transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-105"
                  id="download-ios-btn"
                >
                  <svg className="h-8 w-8 fill-current" viewBox="0 0 384 512">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-91.9-61.7-91.9zM258.6 94.6c21.8-25.9 36.4-62.1 31.8-98.6-31.4 1.5-68.8 20.7-90.6 46.4-19.1 22.3-35.6 58.7-30.4 94.4 34.6 2.5 70-16.3 89.2-42.2z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                      Download on the
                    </div>
                    <div className="text-base font-bold leading-none">App Store</div>
                  </div>
                </a>

                {/* Google Play Store */}
                <a
                  href="#download"
                  className="flex items-center gap-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-5 py-3 text-zinc-900 dark:text-white shadow-lg transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:scale-105"
                  id="download-android-btn"
                >
                  <svg className="h-7 w-7 fill-current" viewBox="0 0 512 512">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                      GET IT ON
                    </div>
                    <div className="text-base font-bold leading-none">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right QR Code / App Preview Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative rounded-3xl bg-white dark:bg-zinc-900/90 p-6 sm:p-8 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 text-center shadow-xl dark:shadow-2xl max-w-sm w-full transition-colors duration-300">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 mb-4 shadow-md">
                  <QrCode className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Scan to Install</h3>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Point your phone camera at the QR code below to download the official True Services app.
                </p>

                {/* Simulated QR Code display */}
                <div className="mt-6 flex justify-center">
                  <div className="rounded-2xl bg-zinc-100 dark:bg-white p-4 shadow-inner border border-zinc-200 dark:border-transparent">
                    <div className="grid grid-cols-5 gap-1.5 w-36 h-36 p-1 bg-white dark:bg-zinc-100 rounded-lg">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            i % 2 === 0 || i % 7 === 0 ? 'bg-zinc-900' : 'bg-zinc-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>iOS 14.0+ & Android 8.0+ supported</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
