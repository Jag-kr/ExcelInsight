"use client";

import { useRef } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { useI18n } from '@/lib/i18n';
import { useFallbackReveal } from '@/hooks/use-reveal';
import { legalContent, LegalDoc } from '@/lib/i18n/legal';

interface LegalPageProps {
  docKey: 'privacy' | 'terms';
  otherDocPath: string;
}

export function LegalPage({ docKey, otherDocPath }: LegalPageProps) {
  const { lang } = useI18n();
  const doc: LegalDoc = legalContent[lang][docKey];
  const contentRef = useRef<HTMLDivElement>(null);

  // Required: without this, the reveal classes below stay at opacity 0 in
  // browsers that lack scroll-driven animation support.
  useFallbackReveal(contentRef);

  return (
    <div ref={contentRef} className="min-h-screen" style={{ background: 'var(--gradient-glow)' }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="glass-card rounded-2xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold brand-text mb-2 narrative-reveal">{doc.title}</h1>
          <p className="text-xs text-muted-foreground mb-8 narrative-reveal">
            {doc.lastUpdatedLabel}: {doc.lastUpdated}
          </p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            {doc.sections.map((section, i) => (
              <section key={i} className="narrative-reveal">
                <h2 className="text-lg font-semibold text-foreground mb-2">{section.heading}</h2>
                <div
                  className="legal-body [&_strong]:text-foreground [&_code]:px-1 [&_code]:mx-1 [&_code]:bg-secondary [&_code]:rounded [&_code]:text-foreground [&_a]:text-primary hover:[&_a]:underline [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mt-2 [&_ul]:space-y-1"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </section>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-border text-sm">
            <Link href="/" className="text-primary hover:underline">{doc.backToApp}</Link>
            <span className="mx-2 text-muted-foreground">•</span>
            <Link href={otherDocPath} className="text-primary hover:underline">{doc.otherDocLinkLabel}</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
