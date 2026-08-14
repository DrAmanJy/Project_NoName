import { Navbar } from '@/components/layout/navbar';
import { HeroSection } from '@/components/marketing/hero-section';
import { AboutSection } from '@/components/marketing/about-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { VideoUploadSection } from '@/components/marketing/video-upload-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { FAQSection } from '@/components/marketing/faq-section';
import { Footer } from '@/components/layout/footer';
import { AppDownloadSection } from '@/components/marketing/app-download-section';

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <VideoUploadSection />
        <TestimonialsSection />
        <FAQSection />
        <AppDownloadSection />
      </main>
      <Footer />
    </div>
  );
}
