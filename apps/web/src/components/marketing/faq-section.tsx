'use client';

import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: "Is it really free to join?",
    a: "100%. We never charge you to upload videos. We pay you if we select your content."
  },
  {
    q: "How is a video selected?",
    a: "Our team reviews submissions daily based on current brand needs. We look for good lighting, authenticity, and vertical format."
  },
  {
    q: "How do I get paid?",
    a: "Once your video is approved, we send payment directly to your bank account or PayPal within 48 hours."
  },
  {
    q: "Is my content safe?",
    a: "Absolutely. You retain full rights to your video until we explicitly purchase it from you."
  },
  {
    q: "How long does review take?",
    a: "Typically 1-3 business days. We will message you on WhatsApp with the result either way."
  }
];

interface FAQItemProps {
  faq: typeof faqs[0];
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, isOpen, onClick }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!contentRef.current) return;
    
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const durOpen = reduced ? 0 : 0.4;
    const durClose = reduced ? 0 : 0.3;

    if (isOpen) {
      gsap.to(contentRef.current, {
        height: "auto",
        opacity: 1,
        duration: durOpen,
        ease: "power2.out"
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: durClose,
        ease: "power2.inOut"
      });
    }
  }, [isOpen]);

  return (
    <div className={`border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300 ${isOpen ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''}`}>
      <button 
        onClick={onClick}
        className="w-full py-6 px-4 flex items-center justify-between text-left focus:outline-none"
      >
        <span className={`text-xl font-medium pr-8 transition-colors duration-300 ${isOpen ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-300'}`}>
          {faq.q}
        </span>
        <span className="flex-shrink-0 relative w-6 h-6 flex items-center justify-center">
          <Plus className={`w-6 h-6 transition-transform duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'rotate-45 text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
        </span>
      </button>
      <div 
        ref={contentRef} 
        className="h-0 opacity-0 overflow-hidden px-4"
      >
        <p className="pb-6 text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">{faq.a}</p>
      </div>
    </div>
  );
};

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white dark:bg-zinc-950 px-4 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-12 text-center text-zinc-900 dark:text-zinc-50">Common Questions</h2>
        
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          {faqs.map((faq, i) => (
            <FAQItem 
              key={i} 
              faq={faq} 
              isOpen={openIndex === i} 
              onClick={() => setOpenIndex(openIndex === i ? null : i)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
