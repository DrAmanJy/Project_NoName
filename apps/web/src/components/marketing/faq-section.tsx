'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I get paid for my uploaded videos?',
      answer:
        'Once your video is submitted and passes review, earnings are instantly credited to your wallet. You can withdraw directly to your bank account or payment provider.',
    },
    {
      question: 'What types of videos are eligible for monetization?',
      answer:
        'Authentic lifestyle moments, daily routines, travels, cafe visits, or workouts. Videos must be original, clear, and meet our community guidelines.',
    },
    {
      question: 'Do I need a large social media following?',
      answer:
        'No following is required! We evaluate content purely based on video authenticity and quality, not follower counts.',
    },
    {
      question: 'How long does video review take?',
      answer:
        'Our automated and team review process typically completes within 24 to 48 hours after submission.',
    },
  ];

  return (
    <section
      id="faq"
      className="bg-zinc-50 dark:bg-black py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-50 transition-colors duration-300"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* FAQ Accordion Column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              FREQUENTLY ASKED QUESTIONS
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Everything you need to know
            </h2>

            <div className="mt-8 space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={faq.question}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-6 text-left text-base font-bold text-zinc-900 dark:text-white"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-zinc-900 dark:text-white' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-900 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
