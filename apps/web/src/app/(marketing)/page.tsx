import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { HeroSection } from '@/components/marketing/hero-section';
import { AboutSection } from '@/components/marketing/about-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { VideoCategoriesSection } from '@/components/marketing/video-categories-section';
import { VideoUploadSection } from '@/components/marketing/video-upload-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import { FAQSection } from '@/components/marketing/faq-section';
import { Footer } from '@/components/layout/footer';
import { AppDownloadSection } from '@/components/marketing/app-download-section';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'LifestudioCanada - Turn Your Video Submissions Into Cash',
  description:
    'Upload video content, pass automated quality verification, and earn up to $100 per approved submission. Join thousands of creators getting paid.',
  keywords: [
    'video monetization',
    'earn money uploading videos',
    'creator economy',
    'video submission platform',
    'get paid for content',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LifestudioCanada - Turn Your Video Submissions Into Cash',
    description:
      'Upload video content, pass automated quality verification, and earn up to $100 per approved submission.',
    url: '/',
    siteName: 'LifestudioCanada',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'LifestudioCanada Landing Page',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifestudioCanada - Turn Your Video Submissions Into Cash',
    description:
      'Upload video content, pass automated quality verification, and earn up to $100 per approved submission.',
    images: ['/logo.png'],
  },
};

export default function MarketingPage() {
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LifestudioCanada',
    operatingSystem: 'Web, iOS, Android',
    applicationCategory: 'MultimediaApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
    },
    description:
      'Turn your creator videos into direct earnings with instant upload verification and reliable payouts.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I earn money submitting videos on LifestudioCanada?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your video through our web or mobile application. Once it passes automated verification and quality review, your reward balance is updated and funds can be cashed out directly.',
        },
      },
      {
        '@type': 'Question',
        name: 'What video quality is required?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Videos should be at least 1080p high definition, original creator content in MP4, MOV, or WEBM format under 500 MB.',
        },
      },
      {
        '@type': 'Question',
        name: 'How fast are creator payouts processed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Approved submissions are credited immediately to your creator balance upon moderation approval.',
        },
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 transition-colors duration-300 selection:bg-zinc-900 selection:text-white dark:bg-black dark:text-zinc-50 dark:selection:bg-white dark:selection:text-zinc-900">
      <JsonLd data={softwareAppSchema} />
      <JsonLd data={faqSchema} />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <AboutSection />
        <VideoCategoriesSection />
        <VideoUploadSection />
        <TestimonialsSection />
        <FAQSection />
        {/* <AppDownloadSection /> */}
      </main>
      <Footer />
    </div>
  );
}
