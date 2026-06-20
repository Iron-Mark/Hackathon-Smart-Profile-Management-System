import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import type { Metric } from 'web-vitals';
import { WebVitalsPanel } from './WebVitalsPanel';

const webVitalsMock = vi.hoisted(() => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

vi.mock('web-vitals', () => webVitalsMock);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const createMetric = (name: Metric['name'], value: number): Metric =>
  ({
    id: `${name.toLowerCase()}-metric`,
    name,
    value,
    delta: value,
    rating: 'good',
    entries: [],
    navigationType: 'navigate',
  }) as Metric;

const emitMetric = (collector: keyof typeof webVitalsMock, metric: Metric) => {
  const report = webVitalsMock[collector].mock.calls[0]?.[0] as
    | ((reportedMetric: Metric) => void)
    | undefined;

  if (!report) {
    throw new Error(`${collector} was not registered`);
  }

  report(metric);
};

test('Web Vitals button opens real metrics reported by the collector', async () => {
  render(
    <StrictMode>
      <WebVitalsPanel />
    </StrictMode>
  );

  expect(screen.getByRole('button', { name: 'Web Vitals' })).toHaveTextContent('0/5');

  await waitFor(() => {
    expect(webVitalsMock.onLCP).toHaveBeenCalledTimes(1);
    expect(webVitalsMock.onCLS).toHaveBeenCalledTimes(1);
    expect(webVitalsMock.onTTFB).toHaveBeenCalledTimes(1);
  });

  act(() => {
    emitMetric('onLCP', createMetric('LCP', 1234.56));
    emitMetric('onCLS', createMetric('CLS', 0.06789));
  });

  const button = screen.getByRole('button', { name: 'Web Vitals' });
  await waitFor(() => expect(button).toHaveTextContent('2/5'));

  fireEvent.click(button);

  expect(await screen.findByText('LCP')).toBeInTheDocument();
  expect(screen.getByText('1235 ms')).toBeInTheDocument();
  expect(screen.getByText('CLS')).toBeInTheDocument();
  expect(screen.getByText('0.068')).toBeInTheDocument();
});
