import { Link } from 'react-router-dom';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import logo from '@/assets/ExcelInsight_Logo.png';

export default function Terms() {
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
        <article className="glass-card rounded-2xl p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Terms of Service</h1>
          <p className="text-xs text-muted-foreground mb-8">Last updated: {updated}</p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using ExcelInsight ("the Service"), you agree to be bound by these
                Terms of Service. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
              <p>
                ExcelInsight is a free, browser-based tool that lets users upload Excel and CSV files
                to generate charts, statistics, and dashboards. All file processing occurs locally in
                your browser.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">3. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Violate any applicable law, regulation, or third-party rights.</li>
                <li>Upload files containing malicious code or attempt to disrupt the Service.</li>
                <li>Reverse-engineer, scrape, or attempt to extract source code beyond what is publicly available.</li>
                <li>Misrepresent the Service or use it in a way that could harm other users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">4. Your Content</h2>
              <p>
                You retain all rights to files and data you process through ExcelInsight. Because
                processing happens locally, we do not receive or store your content. You are solely
                responsible for ensuring you have the right to use any data you upload.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">5. Intellectual Property</h2>
              <p>
                The Service, including its design, branding, and code, is owned by ExcelInsight and
                its licensors. You may not copy, modify, distribute, or create derivative works without
                permission, except as expressly allowed by applicable open-source licenses.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">6. Disclaimer of Warranties</h2>
              <p>
                The Service is provided <strong className="text-foreground">"as is" and "as available"</strong>
                without warranties of any kind, express or implied. We do not guarantee that the
                Service will be uninterrupted, error-free, or that the analytics generated will be
                accurate, complete, or suitable for any particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, ExcelInsight and its operators shall not be
                liable for any indirect, incidental, consequential, or punitive damages arising out of
                or related to your use of the Service, including loss of data, profits, or business
                opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">8. Third-Party Services & Ads</h2>
              <p>
                The Service may display advertisements served by Google AdSense or other third-party
                providers. We are not responsible for the content of any third-party ads or the
                practices of advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">9. Modifications</h2>
              <p>
                We may update these Terms at any time. Continued use of the Service after changes are
                posted constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">10. Termination</h2>
              <p>
                We may suspend or discontinue the Service (or your access to it) at any time, with or
                without notice, for any reason.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">11. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable local
                laws, without regard to conflict-of-law principles.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">12. Contact</h2>
              <p>
                Questions about these Terms? Reach out via the contact information published on the
                ExcelInsight website.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-sm">
            <Link to="/" className="text-primary hover:underline">← Back to ExcelInsight</Link>
            <span className="mx-2 text-muted-foreground">•</span>
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
