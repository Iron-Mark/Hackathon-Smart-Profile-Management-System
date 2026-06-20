import { useEffect, useId, useMemo, useState } from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDemoBackendEnabled } from '@/client/demoBackend';
import { startWebVitalsReporting, type VitalName, type VitalSnapshot } from '@/lib/webVitals';

const metricOrder: VitalName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

const ratingClass = {
  good: 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900/70',
  'needs-improvement': 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-200 dark:bg-amber-950/60 dark:border-amber-900/70',
  poor: 'text-red-800 bg-red-50 border-red-200 dark:text-red-200 dark:bg-red-950/60 dark:border-red-900/70',
};

const ratingSeverity: Record<VitalSnapshot['rating'], number> = {
  good: 1,
  'needs-improvement': 2,
  poor: 3,
};

const ratingLabel: Record<VitalSnapshot['rating'], string> = {
  good: 'good',
  'needs-improvement': 'needs improvement',
  poor: 'poor',
};

const buttonBadgeClass: Record<VitalSnapshot['rating'] | 'collecting', string> = {
  collecting: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
  good: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
  'needs-improvement': 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
  poor: 'border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
};

export function WebVitalsPanel() {
  const statusId = useId();
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, VitalSnapshot>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isDemoBackendEnabled()) return;

    let disposed = false;
    let stopReporting: (() => void) | undefined;

    startWebVitalsReporting((metric) => {
      if (!disposed) {
        setMetrics((current) => ({ ...current, [metric.name]: metric }));
      }
    })
      .then((stop) => {
        if (disposed) {
          stop();
          return;
        }

        stopReporting = stop;
      })
      .catch((err: unknown) => {
        if (!disposed) {
          setError(err instanceof Error ? err.message : 'Unable to load Web Vitals');
        }
      });

    return () => {
      disposed = true;
      stopReporting?.();
    };
  }, []);

  const orderedMetrics = useMemo(
    () => metricOrder.map((name) => metrics[name]).filter(Boolean),
    [metrics]
  );
  const metricCount = orderedMetrics.length;
  const worstRating = useMemo(
    () =>
      orderedMetrics.reduce<VitalSnapshot['rating'] | 'collecting'>((worst, metric) => {
        if (worst === 'collecting') return metric.rating;
        return ratingSeverity[metric.rating] > ratingSeverity[worst] ? metric.rating : worst;
      }, 'collecting'),
    [orderedMetrics]
  );
  const worstRatingText = worstRating === 'collecting' ? 'collecting' : ratingLabel[worstRating];
  const buttonStatus =
    metricCount === 0
      ? 'collecting browser metrics for this page'
      : `${metricCount} of ${metricOrder.length} metrics collected, worst rating ${worstRatingText}`;

  if (!isDemoBackendEnabled()) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <section
          aria-label="Web Vitals panel"
          className="w-[calc(100vw-2rem)] rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg sm:w-72"
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

          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            Values come from this browser session. INP and CLS can update after interaction or tab visibility changes.
          </p>
        </section>
      )}

      <span id={statusId} className="sr-only">
        {buttonStatus}
      </span>

      <Button
        type="button"
        size="sm"
        className="relative h-11 w-11 rounded-full p-0 shadow-lg sm:h-9 sm:w-auto sm:rounded-md sm:px-3"
        aria-expanded={open}
        aria-describedby={statusId}
        title={`Web Vitals: ${buttonStatus}`}
        onClick={() => setOpen((current) => !current)}
      >
        <Activity className="h-4 w-4 sm:mr-2" />
        <span className="sr-only sm:not-sr-only">Web Vitals</span>
        <span
          aria-hidden="true"
          className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[10px] font-semibold tabular-nums sm:static sm:ml-2 sm:h-auto sm:min-w-0 sm:px-1.5 sm:text-[11px] ${buttonBadgeClass[worstRating]}`}
        >
          {metricCount}/{metricOrder.length}
        </span>
      </Button>
    </div>
  );
}
