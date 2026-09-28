import { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { AdsenseScript } from '@/components/AdsenseScript';
import { SITE_URL, GITHUB_URL, CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact ExcelInsight',
  description:
    'How to reach ExcelInsight — email for general enquiries, GitHub issues for bugs and feature requests. Maintained by an independent developer.',
  alternates: { canonical: `${SITE_URL}/contact/` },
};

/**
 * A page rather than a `mailto:` in the footer.
 *
 * No contact form: a form needs a backend to receive it, and this site
 * deliberately has none. Publishing the address and the issue tracker is the
 * honest version of the same thing.
 */
export default function Contact() {
  return (
    <>
      <AdsenseScript />
      <div className="min-h-screen" style={{ background: 'var(--gradient-glow)' }}>
        <SiteHeader />

        <main className="max-w-3xl mx-auto px-6 py-12">
          <article className="glass-card rounded-2xl p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold brand-text mb-6">Contact</h1>

            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <p>
                ExcelInsight is maintained by{' '}
                <a
                  href="https://github.com/Jag-kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Jag-kr
                </a>
                , an independent developer. Messages go to a person, not a support queue, so
                a reply may take a few days.
              </p>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Email</h2>
                <p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
                <p className="mt-2">
                  Best for general questions, privacy or data enquiries, and anything to do
                  with advertising on the site.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Bugs and feature requests
                </h2>
                <p>
                  Please open an issue on GitHub — it keeps the discussion public and
                  searchable for anyone hitting the same thing.
                </p>
                <p className="mt-2">
                  <a
                    href={`${GITHUB_URL}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    {GITHUB_URL.replace('https://', '')}/issues →
                  </a>
                </p>
                <p className="mt-2">
                  If you are reporting a parsing problem, it helps enormously to say which
                  program exported the file (Excel, Google Sheets, Numbers, a database tool)
                  and roughly how many rows and columns it has.{' '}
                  <strong className="text-foreground">Please do not attach the file itself</strong>{' '}
                  if it contains anything confidential — a description of the column shape is
                  usually enough.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Why there is no contact form
                </h2>
                <p>
                  A form needs a server to receive it. ExcelInsight deliberately has no
                  backend — that is the same reason your spreadsheet never leaves your
                  browser. Publishing an address and an issue tracker is the honest version
                  of the same thing.
                </p>
              </section>
            </div>

            <div className="mt-10 pt-6 border-t border-border text-sm">
              <Link href="/" className="text-primary hover:underline">
                Back to the app
              </Link>
              <span className="mx-2 text-muted-foreground">•</span>
              <Link href="/about/" className="text-primary hover:underline">
                About
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
