import { useEffect, useMemo, useState } from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDemoSupabaseEnabled } from '@/client/demoSupabase';
import { startWebVitalsReporting, type VitalName, type VitalSnapshot } from '@/lib/webVitals';

const metricOrder: VitalName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

const ratingClass = {
  good: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900/70',
  'needs-improvement': 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-950/60 dark:border-amber-900/70',
  poor: 'text-red-800 bg-red-50 border-red-200 dark:text-red-200 dark:bg-red-950/60 dark:border-red-900/70',
};

export function WebVitalsPanel() {
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, VitalSnapshot>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isDemoSupabaseEnabled()) return;

    startWebVitalsReporting((metric) => {
      setMetrics((current) => ({ ...current, [metric.name]: metric }));
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load Web Vitals');
    });
  }, []);

  const orderedMetrics = useMemo(
    () => metricOrder.map((name) => metrics[name]).filter(Boolean),
    [metrics]
  );

  if (!isDemoSupabaseEnabled()) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <section
          aria-label="Web Vitals panel"
          className="w-72 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Core Web Vitals</p>
              <p className="text-xs text-muted-foreground">Local browser metrics for this demo session.</p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close Web Vitals"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error ? (
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          ) : orderedMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Collecting metrics...</p>
          ) : (
            <dl className="space-y-2">
              {orderedMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-sm ${ratingClass[metric.rating]}`}
                >
                  <dt className="font-medium">{metric.name}</dt>
                  <dd>{metric.formattedValue}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      <Button
        type="button"
        size="sm"
        className="shadow-lg"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Activity className="mr-2 h-4 w-4" />
        Web Vitals
      </Button>
    </div>
  );
}
