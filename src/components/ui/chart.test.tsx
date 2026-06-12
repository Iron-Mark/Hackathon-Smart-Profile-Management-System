import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ChartStyle } from './chart';

test('sanitizes chart style keys and rejects unsafe CSS color values', () => {
  const { container } = render(
    <ChartStyle
      id='demo]{}chart'
      config={{
        'uploads;body{display:none}': { color: '#22c55e' },
        unsafe: { color: 'red;} body{display:none}' },
      }}
    />
  );

  const css = container.querySelector('style')?.textContent ?? '';

  expect(css).toContain('[data-chart=demo___chart]');
  expect(css).toContain('--color-uploads_body_display_none_');
  expect(css).toContain('#22c55e');
  expect(css).not.toContain('body{display:none}');
  expect(css).not.toContain('demo]{}chart');
  expect(css).not.toContain('red;}');
});
