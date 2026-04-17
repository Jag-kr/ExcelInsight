import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Upload, Sparkles, LayoutDashboard, FileSpreadsheet, Filter, Lightbulb, Combine, Download } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

const features = [
  { icon: FileSpreadsheet, title: 'Excel & CSV Support', desc: 'Upload .xlsx, .xls, or .csv files of any size and instantly turn rows into insights.' },
  { icon: Sparkles, title: 'Auto-Generated Charts', desc: 'Smart detection picks the right chart type — bar, line, pie, area, scatter, radar — for every column.' },
  { icon: LayoutDashboard, title: 'Custom Dashboards', desc: 'Drag, drop, and resize cards to build a dashboard tailored to your data story.' },
  { icon: Lightbulb, title: 'Smart Insights', desc: 'Get column statistics, repeating value detection, and data quality scores automatically.' },
  { icon: Combine, title: 'Column Merging', desc: 'Combine two columns with a custom separator to create new dimensions on the fly.' },
  { icon: Filter, title: 'Interactive Filters', desc: 'Slice your data with one-click filters that update every chart and insight live.' },
  { icon: Download, title: 'PNG Export', desc: 'Export individual charts as high-resolution PNGs for reports and presentations.' },
  { icon: Upload, title: '100% Browser-Based', desc: 'Your file never leaves your device. Everything runs locally for complete privacy.' },
];

const steps = [
  { n: '01', title: 'Upload your file', desc: 'Drop an Excel or CSV file into the uploader. Files are processed locally in your browser — no servers, no signup.' },
  { n: '02', title: 'Explore auto-generated analytics', desc: 'ExcelInsight analyzes every column, detects data types, and instantly builds a dashboard mixing charts, tables, and insights.' },
  { n: '03', title: 'Customize your dashboard', desc: 'Resize cards, add charts from Auto Charts, build manual charts, merge columns, and apply filters.' },
  { n: '04', title: 'Export & share', desc: 'Download charts as PNG to drop into reports, slides, or share with your team.' },
];

const faqs = [
  { q: 'Is ExcelInsight free to use?', a: 'Yes — ExcelInsight is completely free. There are no signups, no subscriptions, and no usage limits. You can analyze unlimited Excel and CSV files.' },
  { q: 'Is my data safe?', a: 'Absolutely. All file processing happens directly in your browser. Your spreadsheets are never uploaded to any server, so your data stays 100% private.' },
  { q: 'What file formats are supported?', a: 'ExcelInsight supports .xlsx, .xls, and .csv files. Most spreadsheets exported from Excel, Google Sheets, Numbers, or any database tool will work.' },
  { q: 'How large a file can I analyze?', a: 'Since processing runs in your browser, performance depends on your device. Files with up to ~100,000 rows typically work smoothly on a modern laptop.' },
  { q: 'Can I export the dashboard or charts?', a: 'Yes — every chart on the dashboard has an "Export PNG" button to download a high-resolution image suitable for reports and presentations.' },
  { q: 'Do I need to install anything?', a: 'No installation required. ExcelInsight runs entirely in your web browser on any device — Windows, Mac, Linux, iOS, or Android.' },
  { q: 'Can I merge columns or filter data?', a: 'Yes. The Build tab lets you merge any two columns into a new one, and the Filter tab lets you drill into specific values across every chart.' },
  { q: 'Does ExcelInsight work offline?', a: 'After the first load, most functionality continues to work even without an internet connection because everything runs client-side.' },
];

export function LandingContent() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-20">
      {/* Features */}
      <section aria-labelledby="features-heading">
        <div className="text-center mb-10">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            Everything you need to analyze Excel files
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ExcelInsight is a free online Excel analytics and dashboard builder. Upload a spreadsheet and get instant charts, statistics, and shareable dashboards — all without writing a single formula.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading">
        <div className="text-center mb-10">
          <h2 id="how-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Go from raw spreadsheet to interactive dashboard in under a minute.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map(({ n, title, desc }) => (
            <article key={n} className="glass-card rounded-xl p-6 flex gap-4">
              <div className="text-3xl font-bold text-primary/40 shrink-0">{n}</div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Use cases / SEO content */}
      <section aria-labelledby="usecases-heading" className="glass-card rounded-2xl p-8 md:p-10">
        <h2 id="usecases-heading" className="text-2xl md:text-3xl font-bold gradient-text mb-4">
          Who uses ExcelInsight?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground leading-relaxed">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Analysts & Marketers</h3>
            <p>Turn campaign exports, sales reports, and survey results into shareable dashboards without firing up Tableau or Power BI.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Students & Researchers</h3>
            <p>Quickly visualize CSV datasets for assignments, theses, and research papers — no Python, R, or SPSS required.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Small Business Owners</h3>
            <p>Understand sales trends, inventory patterns, and customer behavior from your accounting or POS exports.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground">Everything you need to know about ExcelInsight.</p>
        </div>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-lg mb-3 border-0 px-5">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="text-center pt-10 border-t border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ExcelInsight — Free Excel analytics & dashboard builder. Made for analysts, students, and small businesses.
        </p>
      </footer>

      {/* FAQ structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
