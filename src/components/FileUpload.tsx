import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface FileUploadProps {
  onDataLoaded: (data: Record<string, any>[], fileName: string) => void;
  onClear?: () => void;
}

export function FileUpload({ onDataLoaded, onClear }: FileUploadProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = useCallback((file: File) => {
    setLoading(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Lazy-load XLSX (~400KB) only when a file is actually picked.
        const XLSX = await import('xlsx');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet);
        onDataLoaded(jsonData, file.name);
      } catch {
        console.error('Failed to parse file');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded]);

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
      <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-2">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <span className="text-sm text-foreground">{fileName}</span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-6 w-6 p-0"
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
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 sm:gap-4 rounded-xl border-2 border-dashed p-6 sm:p-12 transition-all duration-300 ${
        isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-secondary/50'
      }`}
    >
      <div className="rounded-full bg-primary/10 p-3 sm:p-4">
        <Upload className={`h-6 sm:h-8 w-6 sm:w-8 text-primary ${loading ? 'animate-pulse' : ''}`} />
      </div>
      <div className="text-center">
        <p className="text-base sm:text-lg font-semibold text-foreground">
          {loading ? t('processing') : t('dropFile')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('orClickBrowse')}
        </p>
      </div>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInput}
        className="hidden"
      />
    </label>
  );
}
