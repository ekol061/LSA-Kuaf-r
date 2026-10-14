import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupted large photo data if needed
      this.setState({ hasError: false, error: null });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Bir Görüntüleme Hatası Oluştu
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Uygulama beyaz ekrana düşmeden korundu. Sayfayı yenileyerek işlemlerinize devam edebilirsiniz.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Sayfayı Yenile ve Devam Et</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
