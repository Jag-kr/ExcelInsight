import { useCallback, useId, useState } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { trackEvent, getFileExt } from '@/lib/analytics';

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const ACCEPTED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'application/csv',
]);

function isValidFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (ACCEPTED_EXTENSIONS.includes(ext)) return true;
  if (ACCEPTED_MIME_TYPES.has(file.type)) return true;
  return false;
}

function prefetchDashboard(): void {
  void import('@/components/DashboardGrid').catch(() => {});
}

interface FileUploadProps {
  onDataLoaded: (data: Record<string, any>[], fileName: string) => void;
  onClear?: () => void;
}

export function FileUpload({ onDataLoaded, onClear }: FileUploadProps) {
  const { t } = useI18n();
  const formatId = useId();
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  /**
   * 'reading' reports a real byte count from FileReader; 'parsing' covers the
   * XLSX decode, which is synchronous and gives no progress signal at all, so
   * it shows an indeterminate bar rather than inventing a number. The previous
   * version ran a setInterval that incremented by Math.random() to 85% — it
   * bore no relation to the actual work.
   */
  const [phase, setPhase] = useState<'reading' | 'parsing'>('reading');
  const [progress, setProgress] = useState(0);

  const processFile = useCallback((file: File) => {
    if (!isValidFile(file)) {
      trackEvent('file_upload_rejected', { fileExt: getFileExt(file.name) });
      toast.error(t('invalidFileType'));
      return;
    }
    
    prefetchDashboard();

    setLoading(true);
    setPhase('reading');
    setProgress(0);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = async (e) => {
      setPhase('parsing');
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);
        onDataLoaded(jsonData, file.name);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to parse file:', err);
        trackEvent('file_parse_failed', { fileExt: getFileExt(file.name) });
        toast.error('Failed to parse file. Please check it is a valid Excel or CSV file.');
        setFileName(null);
        setLoading(false);
      }
    };

    reader.onerror = () => {
      console.error('Failed to read file:', reader.error);
      trackEvent('file_parse_failed', { fileExt: getFileExt(file.name) });
      toast.error('Failed to parse file. Please check it is a valid Excel or CSV file.');
      setFileName(null);
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, [onDataLoaded, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (fileName && !loading) {
    return (
      <div className="elevated-card flex items-center gap-3 px-4 py-3 animate-[fade-in_0.3s_ease-out]">
        <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="h-4.5 w-4.5 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">{t('loadedSuccessfully')}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => { setFileName(null); onClear?.(); }}
          aria-label={t('clearFile')}
          title={t('clearFile')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    /**
     * No `role`, `tabIndex` or key handler on this label.
     *
     * ARIA in HTML allows no role attribute on <label> at all, so `role="button"`
     * made the accessibility tree malformed — a labelling element claiming to be a
     * widget. It was only there because the real control, the file input below, was
     * `display: none` and therefore unfocusable, leaving nothing for the keyboard to
     * land on.
     *
     * The input is `sr-only` instead: off-screen but still focusable and still
     * announced, so Enter/Space open the file picker through the browser's own
     * behaviour rather than a synthetic click. Clicking anywhere on the label still
     * forwards to it via htmlFor. focus-within draws the ring, since the focused
     * element is now the invisible input rather than this box.
     */
    <label
      htmlFor={inputId}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 sm:p-14 backdrop-blur-sm transition-all duration-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background ${
        isDragging
          ? 'border-primary bg-primary/8 shadow-glow scale-[1.01]'
          : 'border-foreground/15 bg-foreground/[0.02] hover:border-primary/40 hover:bg-primary/[0.03]'
      }`}
    >
      {/* Upload icon */}
      <div
        className={`relative z-10 rounded-2xl p-4 transition-all duration-300 ${
          isDragging ? 'bg-primary/15 scale-110' : 'bg-primary/8'
        }`}
      >
        {/* No bounce while loading — the progress bar below already carries the
            "working" signal, and a continuously hopping icon next to it reads
            as noise rather than feedback. */}
        <Upload
          className={`h-8 w-8 text-primary transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}
        />
      </div>

      {/* Text */}
      <div className="relative z-10 text-center space-y-1">
        <p className="text-base sm:text-lg font-semibold text-foreground">
          {loading ? t('processing') : t('dropFile')}
        </p>
        {!loading && (
          <p className="text-sm text-muted-foreground">{t('orClickBrowse')}</p>
        )}

        {/* Format badges */}
        {!loading && (
          <div id={formatId} className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['.xlsx', '.xls', '.csv'].map((fmt) => (
              <span
                key={fmt}
                className="rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-foreground/10"
              >
                {fmt}
              </span>
            ))}
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary border border-primary/20">
              {t('badgePrivate')}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar — determinate while the file is being read (a real byte
          count), indeterminate while XLSX decodes (genuinely unknowable). */}
      {loading && (
        <div
          className="relative z-10 w-full max-w-xs"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={phase === 'reading' ? progress : undefined}
          aria-label={t('processing')}
        >
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            {phase === 'reading' ? (
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-fast ease-smooth"
                style={{ width: `${progress}%` }}
              />
            ) : (
              <div className="progress-indeterminate h-full rounded-full" />
            )}
          </div>
          {phase === 'reading' && (
            <p className="text-[11px] text-muted-foreground text-center mt-1.5">
              {progress}{t('parsingFile')}
            </p>
          )}
        </div>
      )}

      {/* sr-only, not `hidden`: this is the actual control, so it has to stay
          focusable and exposed. aria-describedby is conditional because the format
          badges it points at are only rendered while !loading — pointing at a
          removed element is the same dangling-reference problem in miniature. */}
      <input
        id={inputId}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInput}
        aria-label={t('dropFile')}
        aria-describedby={loading ? undefined : formatId}
        className="sr-only"
      />
    </label>
  );
}
