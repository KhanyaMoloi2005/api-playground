import { useEffect, useState } from 'react';
import { checkHealth } from './services/api';

type ServerStatus = 'checking' | 'connected' | 'disconnected';

const STATUS_STYLES: Record<ServerStatus, { dot: string; label: string }> = {
  checking: { dot: 'bg-amber-400 animate-pulse', label: 'Checking server…' },
  connected: { dot: 'bg-emerald-400', label: 'Server: connected' },
  disconnected: { dot: 'bg-red-500', label: 'Server: unreachable' },
};

/**
 * Milestone 1 placeholder: proves the client can reach the backend through
 * the Vite proxy. Replaced by the real interface shell in Milestone 2.
 */
export function App() {
  const [status, setStatus] = useState<ServerStatus>('checking');
  // Bumping this number re-runs the effect below, i.e. performs a new check.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // State is only updated in the async callbacks, never synchronously in
    // the effect body (that would trigger an extra render).
    checkHealth(controller.signal)
      .then(() => setStatus('connected'))
      .catch((err: unknown) => {
        // An aborted request means the component unmounted or a newer
        // check started; ignore it.
        if (controller.signal.aborted) return;
        console.error(err);
        setStatus('disconnected');
      });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setStatus('checking');
    setAttempt((n) => n + 1);
  }

  const { dot, label } = STATUS_STYLES[status];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">API Playground</h1>

      <div
        role="status"
        className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
      >
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true" />
        <span className="text-sm">{label}</span>
        {status === 'disconnected' && (
          <button
            type="button"
            onClick={retry}
            className="ml-2 rounded-md bg-neutral-800 px-3 py-1 text-xs font-medium hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            Retry
          </button>
        )}
      </div>

      {status === 'disconnected' && (
        <p className="max-w-md text-center text-sm text-neutral-400">
          Start the backend with <code className="text-neutral-200">npm run dev</code> from the repo
          root.
        </p>
      )}
    </main>
  );
}
