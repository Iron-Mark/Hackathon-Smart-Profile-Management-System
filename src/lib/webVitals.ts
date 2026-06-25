import type { Metric } from 'web-vitals';

export type VitalName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
export type VitalRating = 'good' | 'needs-improvement' | 'poor';

export interface VitalSnapshot {
  id: string;
  name: VitalName;
  value: number;
  formattedValue: string;
  rating: VitalRating;
}

type WebVitalsSubscription = (metric: VitalSnapshot) => void;
type StopWebVitalsReporting = () => void;

const thresholds: Record<VitalName, [number, number]> = {
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  INP: [200, 500],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
};

const subscribers = new Set<WebVitalsSubscription>();
const latestMetrics = new Map<VitalName, VitalSnapshot>();
let reportingStart: Promise<void> | null = null;

export function getVitalRating(name: VitalName, value: number): VitalRating {
  const [good, poor] = thresholds[name];

  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

export function formatVitalValue(name: VitalName, value: number) {
  if (name === 'CLS') return value.toFixed(3);
  return `${Math.round(value)} ms`;
}

function toVitalSnapshot(metric: Metric): VitalSnapshot {
  const name = metric.name as VitalName;

  return {
    id: metric.id,
    name,
    value: metric.value,
    formattedValue: formatVitalValue(name, metric.value),
    rating: getVitalRating(name, metric.value),
  };
}

function reportMetric(metric: Metric) {
  const snapshot = toVitalSnapshot(metric);
  latestMetrics.set(snapshot.name, snapshot);
  subscribers.forEach((subscriber) => subscriber(snapshot));
}

function ensureWebVitalsReportingStarted() {
  if (!reportingStart) {
    reportingStart = import('web-vitals')
      .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        onCLS(reportMetric);
        onFCP(reportMetric);
        onINP(reportMetric);
        onLCP(reportMetric);
        onTTFB(reportMetric);
      })
      .catch((error: unknown) => {
        reportingStart = null;
        throw error;
      });
  }

  return reportingStart;
}

export async function startWebVitalsReporting(
  onMetric: WebVitalsSubscription
): Promise<StopWebVitalsReporting> {
  latestMetrics.forEach(onMetric);
  subscribers.add(onMetric);

  try {
    await ensureWebVitalsReportingStarted();
  } catch (error) {
    subscribers.delete(onMetric);
    throw error;
  }

  return () => {
    subscribers.delete(onMetric);
  };
}
