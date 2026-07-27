import { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelinsight.xyz';

export const metadata: Metadata = {
  title: 'Privacy Policy – ExcelInsight | 100% Private Excel Analytics',
  description: 'ExcelInsight processes Excel and CSV files entirely in your browser. Read our privacy policy — no uploads, no accounts, no tracking of file contents.',
  alternates: {
    canonical: `${SITE_URL}/privacy/`,
  },
};

export default function Privacy() {
  return <LegalPage docKey="privacy" otherDocPath="/terms/" />;
}
