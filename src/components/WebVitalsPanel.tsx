import { useEffect, useId, useMemo, useState } from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDemoBackendEnabled } from '@/client/demoBackend';
import { startWebVitalsReporting, type VitalName, type VitalSnapshot } from '@/lib/webVitals';

const metricOrder: VitalName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

const ratingClass = {
  good: 'text-success bg-success/10 border-success/30',
  'needs-improvement': 'text-warning bg-warning/10 border-warning/30',
  poor: 'text-destructive bg-destructive/10 border-destructive/30',
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
  collecting: 'border-border bg-muted text-muted-foreground',
  good: 'border-success/40 bg-success/15 text-success',
  'needs-improvement': 'border-warning/40 bg-warning/15 text-warning',
  poor: 'border-destructive/40 bg-destructive/15 text-destructive',
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
            <p className="text-sm text-destructive">{error}</p>
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
