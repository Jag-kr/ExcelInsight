import { Link } from 'react-router-dom';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import logo from '@/assets/ExcelInsight_Logo.png';

export default function Privacy() {
  const updated = 'April 17, 2026';
  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-glow)' }}>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="ExcelInsight logo" className="h-6" />
            <span className="font-bold gradient-text">ExcelInsight</span>
          </Link>
          <ThemeLangSwitcher />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="glass-card rounded-2xl p-6 md:p-10 prose prose-sm max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mb-8">Last updated: {updated}</p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Overview</h2>
              <p>
                ExcelInsight ("we", "our", or "the Service") is a free, browser-based Excel and CSV
                analytics tool. This Privacy Policy explains what limited information is collected when
                you use ExcelInsight and how it is handled.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Files & Data You Upload</h2>
              <p>
                Files you upload to ExcelInsight (.xlsx, .xls, .csv) are processed entirely within your
                web browser. <strong className="text-foreground">Your spreadsheet data is never uploaded
                to our servers, stored, or shared with any third party.</strong> When you close or
                refresh the page, the file and all derived analysis are discarded from memory.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Local Storage</h2>
              <p>
                We store small preferences (selected theme and language) in your browser's
                <code className="px-1 mx-1 bg-secondary rounded text-foreground">localStorage</code>
                so the site remembers your settings on your next visit. This data never leaves your
                device.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Cookies & Analytics</h2>
              <p>
                ExcelInsight may use minimal first-party cookies for site functionality. Third-party
                services described below may set their own cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Advertising — Google AdSense</h2>
              <p>
                We use Google AdSense to display advertisements. Google and its partners may use cookies
                and similar technologies to serve ads based on your prior visits to this and other
                websites. Google's use of advertising cookies enables it and its partners to serve ads
                to you based on your visit to our site and/or other sites on the Internet.
              </p>
              <p className="mt-2">
                You may opt out of personalized advertising by visiting{' '}
                <a className="text-primary hover:underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
                  Google Ads Settings
                </a>
                . You may also opt out of a third-party vendor's use of cookies for personalized
                advertising by visiting{' '}
                <a className="text-primary hover:underline" href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer">
                  www.aboutads.info
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Third-Party Services</h2>
              <p>
                Beyond Google AdSense, we do not knowingly share any information with third parties.
                Hosting infrastructure may collect standard web logs (IP address, user agent, request
                timestamps) for security and reliability purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Children's Privacy</h2>
              <p>
                ExcelInsight is not directed to children under 13, and we do not knowingly collect
                personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Your Rights</h2>
              <p>
                Because we do not collect or store personal data on our servers, there is generally
                nothing for us to delete on your behalf. You can clear browser-side preferences at any
                time by clearing your browser's site data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The "Last updated" date at the top
                of this page indicates when the latest revision was made.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
              <p>
                Questions about this policy? Reach out via the contact information published on the
                ExcelInsight website.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-sm">
            <Link to="/" className="text-primary hover:underline">← Back to ExcelInsight</Link>
            <span className="mx-2 text-muted-foreground">•</span>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
