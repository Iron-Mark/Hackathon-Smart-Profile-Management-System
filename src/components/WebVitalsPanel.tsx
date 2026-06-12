import { useEffect, useMemo, useState } from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDemoSupabaseEnabled } from '@/client/demoSupabase';
import { startWebVitalsReporting, type VitalName, type VitalSnapshot } from '@/lib/webVitals';

const metricOrder: VitalName[] = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

const ratingClass = {
  good: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'needs-improvement': 'text-amber-700 bg-amber-50 border-amber-200',
  poor: 'text-red-700 bg-red-50 border-red-200',
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
          className="w-72 rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Core Web Vitals</p>
              <p className="text-xs text-slate-500">Local browser metrics for this demo session.</p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close Web Vitals"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : orderedMetrics.length === 0 ? (
            <p className="text-sm text-slate-600">Collecting metrics...</p>
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
