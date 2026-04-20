import { LegalPage } from '@/components/LegalPage';
import { SEO } from '@/components/SEO';

export default function Terms() {
  return (
    <>
      <SEO
        path="/terms"
        title="Terms of Service – ExcelInsight | Free Excel Analytics & Dashboards"
        description="Terms governing the use of ExcelInsight — the free online Excel analytics, visualization, and dashboard builder."
        keywords="excel insights terms, excel dashboard terms of service, excel analytics tool terms"
      />
      <LegalPage docKey="terms" otherDocPath="/privacy" />
    </>
  );
}
