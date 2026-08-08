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

interface FileUploadProps {
  onDataLoaded: (data: Record<string, any>[], fileName: string) => void;
  onClear?: () => void;
}

export function FileUpload({ onDataLoaded, onClear }: FileUploadProps) {
  const { t } = useI18n();
  const formatId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = useCallback((file: File) => {
    if (!isValidFile(file)) {
      trackEvent('file_upload_rejected', { fileExt: getFileExt(file.name) });
      toast.error(t('invalidFileType'));
      return;
    }

    setLoading(true);
    setProgress(0);
    setFileName(file.name);

    // Simulate progress for UX
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 85));
    }, 120);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          onDataLoaded(jsonData, file.name);
          setLoading(false);
        }, 400);
      } catch (err: any) {
        clearInterval(interval);
        console.error('Failed to parse file:', err);
        trackEvent('file_parse_failed', { fileExt: getFileExt(file.name) });
        toast.error('Failed to parse file. Please check it is a valid Excel or CSV file.');
        setFileName(null);
        setLoading(false);
      }
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
          <p className="text-xs text-muted-foreground">Loaded successfully</p>
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
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      aria-label={t('dropFile')}
      aria-describedby={formatId}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 sm:p-14 transition-all duration-300 overflow-hidden ${
        isDragging
          ? 'border-primary bg-primary/6 scale-[1.01]'
          : 'border-border/60 hover:border-primary/40 hover:bg-secondary/20'
      }`}
    >
      {/* Upload icon */}
      <div
        className={`relative z-10 rounded-2xl p-4 transition-all duration-300 ${
          isDragging ? 'bg-primary/15 scale-110' : 'bg-primary/8'
        }`}
      >
        {loading ? (
          <Upload className="h-8 w-8 text-primary animate-bounce" />
        ) : (
          <Upload
            className={`h-8 w-8 text-primary transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}
          />
        )}
      </div>

      {/* Text */}
      <div className="relative z-10 text-center space-y-1">
        <p className="text-base sm:text-lg font-semibold text-foreground">
          {loading ? t('processing') : isDragging ? 'Drop your file here' : t('dropFile')}
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
                className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-border/50"
              >
                {fmt}
              </span>
            ))}
            <span className="rounded-lg bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary border border-primary/15">
              {t('badgePrivate')}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="relative z-10 w-full max-w-xs">
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: 'hsl(var(--primary))',
              }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-1.5">
            {Math.round(progress)}% — parsing your file…
          </p>
        </div>
      )}

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInput}
        aria-hidden="true"
        className="hidden"
      />
    </label>
  );
}
