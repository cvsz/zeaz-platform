"use client";
import React, { useEffect, useRef, memo } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickData,
} from 'lightweight-charts';

interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartWidgetProps {
  data: CandleData[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export const ChartWidget: React.FC<ChartWidgetProps> = memo(
  ({ data, colors }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    useEffect(() => {
      if (!chartContainerRef.current) return;

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: {
            type: ColorType.Solid,
            color: colors?.backgroundColor || 'transparent',
          },
          textColor: colors?.textColor || '#d1d5db',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
        crosshair: {
          mode: 1,
          vertLine: {
            color: 'rgba(59, 130, 246, 0.4)',
            style: 2,
            width: 1,
            labelBackgroundColor: '#3B82F6',
          },
          horzLine: {
            color: 'rgba(59, 130, 246, 0.4)',
            style: 2,
            width: 1,
            labelBackgroundColor: '#3B82F6',
          },
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
          timeVisible: false,
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      const formattedData: CandlestickData[] = data.map((d) => ({
        time: (new Date(d.timestamp).getTime() / 1000) as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      formattedData.sort(
        (a, b) => (a.time as number) - (b.time as number),
      );
      candlestickSeries.setData(formattedData);
      chart.timeScale().fitContent();

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }, [data, colors]);

    return (
      <div
        ref={chartContainerRef}
        style={{ width: '100%', height: '300px' }}
      />
    );
  },
);

ChartWidget.displayName = 'ChartWidget';
