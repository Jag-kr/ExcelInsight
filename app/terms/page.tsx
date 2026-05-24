import { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service – ExcelInsight | Free Excel Analytics & Dashboards',
  description: 'Terms governing the use of ExcelInsight — the free online Excel analytics, visualization, and dashboard builder.',
  alternates: {
    canonical: '/terms',
  },
};

export default function Terms() {
  return <LegalPage docKey="terms" otherDocPath="/privacy" />;
}
