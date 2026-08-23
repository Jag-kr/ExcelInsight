import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export default function NotFound() {
  return (
    <div className="min-h-screen hero-surface grid-backdrop">
      <SiteHeader />
      <main className="flex flex-col items-center justify-center text-center px-4 py-24">
        <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          The page you're looking for doesn't exist or may have moved. Head back
          to the homepage to upload a file and build a dashboard.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Back to ExcelInsight
        </Link>
      </main>
    </div>
  );
}
