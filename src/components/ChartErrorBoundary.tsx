import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
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
      return (
        <Card className="elevated-card p-5 min-h-[200px] flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-0.5">
              {this.props.title ? `"${this.props.title}" failed to render` : 'Chart failed to render'}
            </p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              This chart encountered an error. Try resizing or removing it.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={this.handleRetry}
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
