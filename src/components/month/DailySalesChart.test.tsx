import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { DailyTotal } from '@/domain/monthlySummary';
import { DailySalesChart } from './DailySalesChart';

const PLOT_WIDTH = 300;
// Three days, so each one owns 100 px of the plot.
const DAILY_TOTALS = [
  { day: '2026-11-01', salesCents: 1000 },
  { day: '2026-11-02', salesCents: 5000 },
  { day: '2026-11-03', salesCents: 2500 },
] as DailyTotal[];

// The live caption above the bars; the screen-reader table below repeats the amounts.
const caption = () => document.querySelector('[aria-live]')?.textContent?.replace(/\s/g, ' ');

function renderChart() {
  render(<DailySalesChart dailyTotals={DAILY_TOTALS} />);
  const plot = screen.getByTestId('daily-sales-plot');
  plot.getBoundingClientRect = () => ({ left: 0, width: PLOT_WIDTH }) as DOMRect;
  return plot;
}

afterEach(cleanup);

describe('DailySalesChart', () => {
  it('starts on the best day of the month', () => {
    renderChart();
    expect(caption()).toBe('Melhor dia: 02/11, R$ 50,00');
  });

  it('picks the day under the finger anywhere in its column, not only on the bar', () => {
    const plot = renderChart();
    fireEvent.pointerDown(plot, { clientX: 20, pointerId: 1 });
    fireEvent.pointerUp(plot, { clientX: 20, pointerId: 1 });
    expect(caption()).toBe('01/11: R$ 10,00');
  });

  it('sweeps across days while the finger slides', () => {
    const plot = renderChart();
    fireEvent.pointerDown(plot, { clientX: 20, pointerId: 1 });
    fireEvent.pointerMove(plot, { clientX: 250, pointerId: 1 });
    expect(caption()).toBe('03/11: R$ 25,00');
    fireEvent.pointerUp(plot, { clientX: 250, pointerId: 1 });
    expect(caption()).toBe('03/11: R$ 25,00');
  });

  it('goes back to the best day when the shown day is tapped again', () => {
    const plot = renderChart();
    fireEvent.pointerDown(plot, { clientX: 20, pointerId: 1 });
    fireEvent.pointerUp(plot, { clientX: 20, pointerId: 1 });
    fireEvent.pointerDown(plot, { clientX: 30, pointerId: 2 });
    fireEvent.pointerUp(plot, { clientX: 30, pointerId: 2 });
    expect(caption()).toBe('Melhor dia: 02/11, R$ 50,00');
  });

  it('ignores moves without a finger down', () => {
    const plot = renderChart();
    fireEvent.pointerMove(plot, { clientX: 20, pointerId: 1 });
    expect(caption()).toBe('Melhor dia: 02/11, R$ 50,00');
  });
});
