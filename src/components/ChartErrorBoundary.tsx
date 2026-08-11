import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

function ChartErrorFallback({ title, onRetry }: { title?: string; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <Card className="elevated-card p-5 min-h-[200px] flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-0.5">
          {title ? `"${title}" ${t('chartFailedToRenderSuffix')}` : t('chartFailedToRender')}
        </p>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          {t('chartErrorDesc')}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs h-7"
        onClick={onRetry}
      >
        <RefreshCw className="h-3 w-3" />
        {t('retry')}
      </Button>
    </Card>
  );
}

/**
 * ChartErrorBoundary — catches render errors inside chart cards so a single
 * malformed chart cannot crash the rest of the dashboard.
 */
export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[ChartErrorBoundary] Chart render failed:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return <ChartErrorFallback title={this.props.title} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
