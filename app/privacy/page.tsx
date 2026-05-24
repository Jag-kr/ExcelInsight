import { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy – ExcelInsight | 100% Private Excel Analytics',
  description: 'ExcelInsight processes Excel and CSV files entirely in your browser. Read our privacy policy — no uploads, no accounts, no tracking of file contents.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function Privacy() {
  return <LegalPage docKey="privacy" otherDocPath="/terms" />;
}
