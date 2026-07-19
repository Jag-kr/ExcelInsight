"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FaqItem {
  q: string;
  a: string;
}

function FaqAccordionItem({ faq }: { faq: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-border/60 bg-card/70 shadow-sm transition-all hover:border-primary/30 hover:bg-card/90">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-expanded={open}
            className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <span>{faq.q}</span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <FaqAccordionItem key={index} faq={faq} />
      ))}
    </div>
  );
}
