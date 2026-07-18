'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

interface TradingViewChartProps {
  data: Array<{ time: number; value: number }>; // Unix timestamps in seconds, e.g. 1721151600
  lineColor?: string;
  topColor?: string;
  bottomColor?: string;
}

export default function TradingViewChart({
  data,
  lineColor = '#22C55E',
  topColor = 'rgba(34, 197, 94, 0.15)',
  bottomColor = 'rgba(34, 197, 94, 0.0)',
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#111318' },
        textColor: '#9CA3AF',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: '#24262B' },
        horzLines: { color: '#24262B' },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        horzLine: {
          visible: true,
          labelVisible: true,
          color: '#3B82F6',
        },
        vertLine: {
          visible: true,
          labelVisible: true,
          color: '#3B82F6',
        },
      },
      width: chartContainerRef.current.clientWidth || 400,
      height: chartContainerRef.current.clientHeight || 280,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: lineColor,
      topColor: topColor,
      bottomColor: bottomColor,
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price.toFixed(0)}%`,
      },
    });

    areaSeries.setData(data as any);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update Data dynamically when props change
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data as any);
      // Auto fit content occasionally to keep it centered
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[220px]" />;
}
