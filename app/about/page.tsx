import { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { AdsenseScript } from '@/components/AdsenseScript';
import { SITE_URL, GITHUB_URL, CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About ExcelInsight — Who Builds It and Why',
  description:
    'ExcelInsight is an independent, open-source Excel and CSV dashboard tool that runs entirely in your browser. Who maintains it, why it exists, and how the privacy claim is verifiable.',
  alternates: { canonical: `${SITE_URL}/about/` },
};

/**
 * Deliberately a server component with English-only copy.
 *
 * The legal pages render through `LegalPage`, which is `"use client"` because it
 * switches language from context. That is the wrong trade here: this page exists
 * to answer "who runs this site?" for a reader — and for a crawler — so the text
 * has to be in the served HTML, not assembled after hydration.
 */
export default function About() {
  return (
    <>
      <AdsenseScript />
      <div className="min-h-screen" style={{ background: 'var(--gradient-glow)' }}>
        <SiteHeader />

        <main className="max-w-3xl mx-auto px-6 py-12">
          <article className="glass-card rounded-2xl p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold brand-text mb-6">About ExcelInsight</h1>

            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <section>
                <p>
                  ExcelInsight turns a spreadsheet into a working dashboard. You open the
                  page, drop in an <code>.xlsx</code>, <code>.xls</code> or <code>.csv</code>{' '}
                  file, and it reads your columns, works out which are numbers, dates,
                  categories or identifiers, and builds charts and KPIs from them. You can
                  then rearrange the layout, filter the data, add your own charts and export
                  the result as a PDF.
                </p>
                <p className="mt-3">
                  There is no account, no subscription, no usage limit and no trial. It is
                  free because it costs almost nothing to run — see below.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Who builds it</h2>
                <p>
                  ExcelInsight is built and maintained by{' '}
                  <a
                    href="https://github.com/Jag-kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Jag-kr
                  </a>
                  , an independent developer. It is not a company, a startup or a funded
                  product — it is one person maintaining a tool in the open.
                </p>
                <p className="mt-3">
                  {/* TODO(owner): replace this paragraph with your own reason for building it.
                      A specific, concrete sentence beats generic product copy here. */}
                  It exists because building a simple chart from a spreadsheet usually means
                  pivot tables, a paid BI licence, or uploading a file you would rather not
                  hand to a third party. None of those should be necessary to look at your
                  own data.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Why your file never leaves your device
                </h2>
                <p>
                  ExcelInsight has no server that receives your data — no upload endpoint, no
                  database, no file storage. The page is static, and the parsing, column
                  analysis and chart rendering all run as JavaScript inside your own browser
                  tab. Close the tab and the data is gone.
                </p>
                <p className="mt-3">
                  You do not have to take that on trust. The source is public, so you can
                  read exactly what it does — or open your browser&apos;s network tab while
                  you use it and watch that your file is never sent anywhere.
                </p>
                <p className="mt-3">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Read the source on GitHub →
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  What it does not do
                </h2>
                <p>Being straight about the limits, because they are real:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    It reads the <strong>first worksheet only</strong>. Multi-sheet workbooks
                    load the first sheet and tell you the others were skipped.
                  </li>
                  <li>
                    Parsing happens on the main thread, so comfort drops off somewhere around{' '}
                    <strong>100,000 rows</strong> depending on your machine.
                  </li>
                  <li>
                    There is <strong>no offline mode</strong>. Loading the page needs a
                    connection; processing your file afterwards does not.
                  </li>
                  <li>
                    There is no AI involved. The insights are ordinary, deterministic
                    statistics — the same numbers every time for the same file.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">How it is funded</h2>
                <p>
                  The site is static and serves no data from a backend, so hosting is
                  inexpensive. Costs are covered by advertising alongside the content. Ads are
                  never shown on the dashboard itself while you are working with your data.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Get in touch</h2>
                <p>
                  Bug reports and feature requests are best filed as{' '}
                  <a
                    href={`${GITHUB_URL}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub issues
                  </a>
                  . For anything else, email{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                  , or see the <Link href="/contact/" className="text-primary hover:underline">contact page</Link>.
                </p>
              </section>
            </div>

            <div className="mt-10 pt-6 border-t border-border text-sm">
              <Link href="/" className="text-primary hover:underline">
                Back to the app
              </Link>
              <span className="mx-2 text-muted-foreground">•</span>
              <Link href="/contact/" className="text-primary hover:underline">
                Contact
              </Link>
              <span className="mx-2 text-muted-foreground">•</span>
              <Link href="/privacy/" className="text-primary hover:underline">
                Privacy
              </Link>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}
