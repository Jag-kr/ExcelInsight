import { LegalPage } from '@/components/LegalPage';
import { SEO } from '@/components/SEO';

export default function Privacy() {
  return (
    <>
      <SEO
        path="/privacy"
        title="Privacy Policy – ExcelInsight | 100% Private Excel Analytics"
        description="ExcelInsight processes Excel and CSV files entirely in your browser. Read our privacy policy — no uploads, no accounts, no tracking of file contents."
        keywords="excel insights privacy, excel analytics privacy, private excel tool, secure excel visualization"
      />
      <LegalPage docKey="privacy" otherDocPath="/terms" />
    </>
  );
}
