import { Link } from 'react-router-dom';
import { ThemeLangSwitcher } from '@/components/ThemeLangSwitcher';
import logo from '@/assets/ExcelInsight_Logo.png';
import { useI18n } from '@/lib/i18n';
import { legalContent, LegalDoc } from '@/lib/i18n/legal';

interface LegalPageProps {
  docKey: 'privacy' | 'terms';
  otherDocPath: string;
}

export function LegalPage({ docKey, otherDocPath }: LegalPageProps) {
  const { lang } = useI18n();
  const doc: LegalDoc = legalContent[lang][docKey];

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
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{doc.title}</h1>
          <p className="text-xs text-muted-foreground mb-8">
            {doc.lastUpdatedLabel}: {doc.lastUpdated}
          </p>

          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            {doc.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-lg font-semibold text-foreground mb-2">{section.heading}</h2>
                <div
                  className="legal-body [&_strong]:text-foreground [&_code]:px-1 [&_code]:mx-1 [&_code]:bg-secondary [&_code]:rounded [&_code]:text-foreground [&_a]:text-primary hover:[&_a]:underline [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mt-2 [&_ul]:space-y-1"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </section>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-border text-sm">
            <Link to="/" className="text-primary hover:underline">{doc.backToApp}</Link>
            <span className="mx-2 text-muted-foreground">•</span>
            <Link to={otherDocPath} className="text-primary hover:underline">{doc.otherDocLinkLabel}</Link>
          </div>
        </article>
      </main>
    </div>
  );
}
