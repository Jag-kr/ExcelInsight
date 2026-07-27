import { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelinsight.xyz';

export const metadata: Metadata = {
  title: 'Terms of Service – ExcelInsight | Free Excel Analytics & Dashboards',
  description: 'Terms governing the use of ExcelInsight — the free online Excel analytics, visualization, and dashboard builder.',
  alternates: {
    canonical: `${SITE_URL}/terms/`,
  },
};

export default function Terms() {
  return <LegalPage docKey="terms" otherDocPath="/privacy/" />;
}
