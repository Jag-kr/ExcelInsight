interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <details
          key={index}
          className="group rounded-xl border border-border/60 bg-card/70 shadow-sm transition-colors hover:border-primary/30 hover:bg-card/90 open:border-primary/30 open:bg-card/90"
        >
          <summary
            className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-left text-sm font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden"
          >
            <span>{faq.q}</span>
            {/* Chevron — rotates when open */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          {/*
            Answer is ALWAYS in the DOM — visible to crawlers, Google AI Overviews,
            Perplexity, and other LLM crawlers regardless of open/closed state.
          */}
          <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
            {faq.a}
          </p>
        </details>
      ))}
    </div>
  );
}
