"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { FileUpload } from "@/components/FileUpload";
import { SiteHeader } from "@/components/SiteHeader";
import { LandingContent } from "@/components/LandingContent";
import { AdsenseScript } from "@/components/AdsenseScript";
import { useI18n } from "@/lib/i18n";
import { hasStoredSession } from "@/lib/session-storage";
import { BarChart3, Database, LayoutDashboard, Sparkles } from "lucide-react";

// Served from public/ so logo swaps don't need a rebuild (SiteHeader uses the same path).
const LOGO_SRC = "/logo-64.png";

/**
 * The dashboard is a separate chunk, not a separate URL.
 *
 * These two views used to live in one 1085-line component with an early
 * return between them. That kept the whole dashboard — its Radix primitives,
 * data-analyzer, chart-themes — on the static import graph of a page most
 * visitors never scroll past the upload box on. A `dynamic()` boundary is all
 * it took to fix that; a `/dashboard` route was not needed, and would have
 * been worse, because it would have made localStorage the only channel for
 * handing the parsed rows across and that write has no size cap.
 *
 * `ssr: false` is honest: nothing below renders until the user has a file.
 */
const DashboardApp = dynamic(
  () =>
    import("@/components/dashboard/DashboardApp").then((m) => m.DashboardApp),
  { ssr: false },
);

/** Covers the gap between "file picked" and "DashboardApp has analysed it". */
function AnalyzingOverlay({ t }: { t: (key: any) => string }) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
        </div>
        <p className="text-base font-semibold text-foreground">
          {t("analyzingData")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("buildingChartsInsights")}
        </p>
        <div className="flex items-center justify-center gap-1 pt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{
                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [upload, setUpload] = useState<{
    data: Record<string, any>[];
    fileName: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (hasStoredSession()) {
      setHasSession(true);
      // Warm the chunk right away: a returning user is going straight to the
      // dashboard, and shouldn't sit on a landing paint while it downloads.
      void import("@/components/dashboard/DashboardApp").catch(() => {});
    }
  }, []);

  /**
   * Note what this does *not* do: analyse. It stores the raw parse result and
   * nothing more, which is what keeps data-analyzer off this bundle.
   * DashboardApp derives the columns, suggestions and layout on mount.
   */
  const handleDataLoaded = useCallback(
    (data: Record<string, any>[], fileName: string) =>
      setUpload({ data, fileName }),
    [],
  );

  const handleClearFile = useCallback(() => {
    setUpload(null);
    setHasSession(false);
  }, []);

  // `mounted` gates only the restore path: the server renders the landing page,
  // so the first client paint has to as well. A fresh upload can only happen
  // after mount, so it needs no such guard.
  if (upload || (mounted && hasSession)) {
    return (
      <Suspense fallback={<AnalyzingOverlay t={t} />}>
        <DashboardApp initialUpload={upload} onClearFile={handleClearFile} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen hero-surface grid-backdrop">
      {/* Only the landing view has real publisher content — the loading
          overlay and post-upload dashboard don't, so this must not live in
          the root layout (see AdsenseScript). */}
      <AdsenseScript />
      <SiteHeader />

      <main className="relative">
        {/* ── Hero section — single column, upload-first tool front door (works identically on every breakpoint) ── */}
        <section className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-10 lg:pt-14 pb-6 hero-appear text-center">
          {/* Row 1: logo icon + brand name */}
          <div className="flex items-center gap-2.5 justify-center hero-appear-badge">
            {/* alt="" — decorative here: the span beside it carries the name, so
                alt text would just make screen readers say the brand twice. */}
            <img
              src={LOGO_SRC}
              alt=""
              width="32"
              height="32"
              fetchPriority="high"
              decoding="async"
              className="h-8 w-8 flex-shrink-0"
            />
            <span className="font-bold text-base brand-mark tracking-tight">
              ExcelInsight
            </span>
          </div>

          {/* Headline — compact and functional, not a marketing display treatment. The shimmer gradient is reserved for this one moment on the page. */}
          {/* Scaled up from text-xl/2xl: at 24px this read as a caption rather
              than a headline. Still deliberately short of a marketing display
              size — the upload zone below it must stay above the fold. */}
          <h1 className="mt-3 text-2xl sm:text-4xl font-bold hero-gradient-text tracking-tight hero-appear-title">
            {t("heroTitle")}
          </h1>

          {/* Upload zone — the primary action, appears immediately (zero delay) */}
          <div className="mt-6 hero-appear-upload">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>

          {/* Subtext — reassurance/context, secondary to the action itself */}
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed hero-appear-sub">
            {t("uploadSubtitle")}
          </p>

          {/* Trust pills — functional metadata about the tool, not marketing badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2 justify-center hero-appear-pills">
            {[t("badgePrivate"), t("badgeInstant"), t("badgeExport")].map(
              (label) => (
                <span key={label} className="stat-chip">
                  {label}
                </span>
              ),
            )}
          </div>
        </section>

        {/* Feature cards — full-width strip, spans wider than the narrow hero column */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 pb-6 lg:pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl lg:max-w-none mx-auto text-center hero-appear-feats">
            {[
              {
                icon: Database,
                label: t("smartDetection"),
                desc: t("smartDetectionDesc"),
              },
              {
                icon: BarChart3,
                label: t("autoCharts"),
                desc: t("autoChartsDesc"),
              },
              {
                icon: LayoutDashboard,
                label: t("dashboards"),
                desc: t("dashboardsDesc"),
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="elevated-card p-4 text-center group hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <LandingContent />
      </main>
    </div>
  );
}
