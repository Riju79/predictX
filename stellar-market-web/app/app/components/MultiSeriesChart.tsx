'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { t, fontBody, fontMono } from '../tokens';

export interface OutcomeSeries {
  id: string;
  name: string;
  color: string;
  probability: number;
}

export type Timeframe = '1H' | '1D' | '1W';

interface MultiSeriesChartProps {
  outcomes: OutcomeSeries[];
  history: Record<string, number[]>; // outcome.id -> array of values (0-100)
  timestamps?: string[]; // optional formatted labels
  height?: number;
  showLegend?: boolean;
  showTimeframes?: boolean;
  legendVariant?: 'pills' | 'text';
  yAxisPosition?: 'left' | 'right' | 'both';
  activeTimeframe?: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
}

export const TIMEFRAMES: Timeframe[] = ['1H', '1D', '1W'];

export default function MultiSeriesChart({
  outcomes,
  history,
  timestamps,
  height = 220,
  showLegend = true,
  showTimeframes = true,
  legendVariant = 'text',
  yAxisPosition = 'right',
  activeTimeframe = '1H',
  onTimeframeChange,
}: MultiSeriesChartProps) {
  const [internalTf, setInternalTf] = useState<Timeframe>('1H');
  const [hiddenOutcomes, setHiddenOutcomes] = useState<Record<string, boolean>>({});
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tf = onTimeframeChange ? activeTimeframe : internalTf;

  const handleTfClick = (selectedTf: Timeframe) => {
    if (onTimeframeChange) {
      onTimeframeChange(selectedTf);
    } else {
      setInternalTf(selectedTf);
    }
  };

  const toggleOutcomeVisibility = (id: string) => {
    setHiddenOutcomes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pointsSlice = useMemo(() => {
    const limits: Record<Timeframe, number> = { '1H': 14, '1D': 24, '1W': 36 };
    return limits[tf] || 24;
  }, [tf]);

  const W = 600;
  const H = height;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 22;
  const PAD_LEFT = yAxisPosition === 'left' || yAxisPosition === 'both' ? 36 : 14;
  const PAD_RIGHT = yAxisPosition === 'right' || yAxisPosition === 'both' ? 44 : 14;

  const chartArea = useMemo(() => {
    const chartW = W - PAD_LEFT - PAD_RIGHT;
    const chartH = H - PAD_TOP - PAD_BOTTOM;

    const slicedData: Record<string, number[]> = {};
    let maxLength = 0;

    outcomes.forEach(o => {
      const raw = history[o.id] || [o.probability];
      const sliced = raw.slice(-pointsSlice);
      slicedData[o.id] = sliced;
      if (sliced.length > maxLength) maxLength = sliced.length;
    });

    if (maxLength === 0) return { outcomePaths: [], gridLines: [], timestampsList: [], maxLength: 0, chartW, chartH };

    let maxY = 60;
    const minY = 0;

    let allVals: number[] = [];
    outcomes.forEach(o => {
      if (!hiddenOutcomes[o.id]) {
        allVals.push(...(slicedData[o.id] || []));
      }
    });

    if (allVals.length > 0) {
      const maxVal = Math.max(...allVals);
      if (maxVal > 80) maxY = 100;
      else if (maxVal > 60) maxY = 80;
      else if (maxVal > 45) maxY = 60;
      else if (maxVal > 30) maxY = 45;
      else maxY = 30;
    }

    const outcomePaths = outcomes.map(o => {
      const isHidden = hiddenOutcomes[o.id];
      if (isHidden) return { outcome: o, points: [], linePath: '', areaPath: '', isHidden: true };

      const vals = slicedData[o.id] || [];
      const len = vals.length;

      const points = vals.map((v, idx) => {
        const x = PAD_LEFT + (len > 1 ? (idx / (len - 1)) * chartW : chartW / 2);
        const y = PAD_TOP + chartH - (Math.min(maxY, Math.max(minY, v)) / maxY) * chartH;
        return { x, y, value: v, idx };
      });

      const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');

      const areaPath = points.length > 0
        ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${H - PAD_BOTTOM} L${points[0].x.toFixed(1)},${H - PAD_BOTTOM} Z`
        : '';

      return { outcome: o, points, linePath, areaPath, isHidden: false };
    });

    // Grid lines dynamic scaling
    const gridYValues = maxY === 100 
      ? [0, 25, 50, 75, 100] 
      : maxY === 80 
      ? [0, 20, 40, 60, 80] 
      : maxY === 60 
      ? [0, 15, 30, 45, 60] 
      : maxY === 45 
      ? [0, 10, 20, 30, 45] 
      : [0, 5, 10, 20, 30];

    const gridLines = gridYValues.map(val => {
      const y = PAD_TOP + chartH - (val / maxY) * chartH;
      return { val, y };
    });

    const now = new Date();
    const timestampsList: string[] = [];
    for (let i = 0; i < maxLength; i++) {
      if (timestamps && timestamps[i]) {
        timestampsList.push(timestamps[i]);
      } else {
        if (tf === '1H') {
          // Exact intraday clock time e.g. 9:15 PM, 9:20 PM
          const minsAgo = (maxLength - 1 - i) * 5;
          const t = new Date(now.getTime() - minsAgo * 60 * 1000);
          timestampsList.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else if (tf === '1D') {
          // Exact daily date e.g. July 15, July 16, July 21
          const daysAgo = (maxLength - 1 - i);
          const t = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          timestampsList.push(t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        } else {
          // Weekly / Monthly date e.g. June 1, July 1, August 1
          const daysAgo = (maxLength - 1 - i) * 6;
          const t = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          timestampsList.push(t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
      }
    }

    return { outcomePaths, gridLines, timestampsList, maxLength, chartW, chartH };
  }, [outcomes, history, timestamps, pointsSlice, hiddenOutcomes, tf, H, PAD_LEFT, PAD_RIGHT]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || chartArea.maxLength <= 1) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    const mouseY = ((e.clientY - rect.top) / rect.height) * H;

    const chartW = W - PAD_LEFT - PAD_RIGHT;
    const relativeX = Math.max(0, Math.min(chartW, mouseX - PAD_LEFT));
    const closestIdx = Math.round((relativeX / chartW) * (chartArea.maxLength - 1));

    setHoveredIdx(closestIdx);
    setHoverPos({ x: e.clientX - rect.left, y: mouseY });
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setHoverPos(null);
  };

  const hoveredTimestamp = hoveredIdx !== null && chartArea.timestampsList[hoveredIdx]
    ? chartArea.timestampsList[hoveredIdx]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {/* Top Header: Multi-Series Inline Legend matching user screenshot */}
      {showLegend && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {legendVariant === 'text' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', fontSize: 13, fontFamily: fontBody }}>
              {outcomes.map(o => {
                const isHidden = hiddenOutcomes[o.id];
                return (
                  <div
                    key={o.id}
                    onClick={() => toggleOutcomeVisibility(o.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      cursor: 'pointer', opacity: isHidden ? 0.4 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: o.color }} />
                    <span style={{ color: t.textDim, fontWeight: 500 }}>{o.name}</span>
                    <span style={{ color: t.text, fontWeight: 700, fontFamily: fontMono }}>
                      {o.probability.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {outcomes.map(o => {
                const isHidden = hiddenOutcomes[o.id];
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleOutcomeVisibility(o.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 14,
                      border: `1px solid ${isHidden ? t.line : o.color + '66'}`,
                      background: isHidden ? t.surface2 : o.color + '15',
                      color: isHidden ? t.textFaint : t.text,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: fontBody,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: o.color }} />
                    <span>{o.name}</span>
                    <span style={{ fontFamily: fontMono, color: o.color, marginLeft: 2 }}>{o.probability.toFixed(1)}%</span>
                  </button>
                );
              })}
            </div>
          )}

          {showTimeframes && (
            <div style={{ display: 'flex', gap: 2, background: '#181C26', border: `1px solid ${t.line}`, borderRadius: 8, padding: 2, marginLeft: 'auto' }}>
              {TIMEFRAMES.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleTfClick(opt)}
                  style={{
                    padding: '3px 8px', borderRadius: 5, border: 'none',
                    background: tf === opt ? t.surface : 'transparent',
                    color: tf === opt ? t.text : t.textFaint,
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    fontFamily: fontBody,
                  }}
                >{opt}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SVG Multi-Series Line Chart Container */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: H, display: 'block', overflow: 'visible', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Dotted Grid Lines & Y-Axis Labels */}
          {chartArea.gridLines.map(({ val, y }) => (
            <g key={val}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={W - PAD_RIGHT}
                y2={y}
                stroke="#252A36"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              {(yAxisPosition === 'right' || yAxisPosition === 'both') && (
                <text
                  x={W - PAD_RIGHT + 8}
                  y={y + 3.5}
                  fill="#6B7280"
                  fontSize="11"
                  fontFamily={fontMono}
                  textAnchor="start"
                >
                  {val}%
                </text>
              )}
              {(yAxisPosition === 'left' || yAxisPosition === 'both') && (
                <text
                  x={PAD_LEFT - 6}
                  y={y + 3.5}
                  fill="#6B7280"
                  fontSize="11"
                  fontFamily={fontMono}
                  textAnchor="end"
                >
                  {val}%
                </text>
              )}
            </g>
          ))}

          {/* Clean Solid Line Paths (No Glow / Area Fill) */}
          {chartArea.outcomePaths.map(({ outcome, linePath, points, isHidden }) => {
            if (isHidden || !linePath) return null;
            return (
              <g key={outcome.id}>
                {/* Clean Crisp Solid Line Path */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={outcome.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Solid Endpoint Dot (No Glow Outer Circle) */}
                {points.length > 0 && (
                  <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="3.5"
                    fill={outcome.color}
                  />
                )}
              </g>
            );
          })}

          {/* Hover Crosshair & Indicators */}
          {hoveredIdx !== null && (
            <g>
              {(() => {
                const chartW = W - PAD_LEFT - PAD_RIGHT;
                const crosshairX = PAD_LEFT + (hoveredIdx / (chartArea.maxLength - 1)) * chartW;
                return (
                  <>
                    <line
                      x1={crosshairX}
                      y1={PAD_TOP}
                      x2={crosshairX}
                      y2={H - PAD_BOTTOM}
                      stroke="#4B5563"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    {chartArea.outcomePaths.map(({ outcome, points, isHidden }) => {
                      if (isHidden || !points[hoveredIdx]) return null;
                      const pt = points[hoveredIdx];
                      return (
                        <circle
                          key={outcome.id}
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill={outcome.color}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </g>
          )}

          {/* Bottom Horizontal X-Axis Time / Date Labels */}
          {chartArea.maxLength > 1 && (
            <g>
              {[0, Math.floor((chartArea.maxLength - 1) / 4), Math.floor((chartArea.maxLength - 1) / 2), Math.floor((chartArea.maxLength - 1) * 3 / 4), chartArea.maxLength - 1].map((stepIdx, idx) => {
                const chartW = W - PAD_LEFT - PAD_RIGHT;
                const x = PAD_LEFT + (stepIdx / (chartArea.maxLength - 1)) * chartW;
                const label = chartArea.timestampsList[stepIdx] || '';
                return (
                  <text
                    key={idx}
                    x={x}
                    y={H - 4}
                    fill="#6B7280"
                    fontSize="10"
                    fontFamily={fontMono}
                    textAnchor={idx === 0 ? 'start' : idx === 4 ? 'end' : 'middle'}
                    suppressHydrationWarning
                  >
                    {label}
                  </text>
                );
              })}
            </g>
          )}
        </svg>

        {/* Floating Hover Tooltip */}
        {hoveredIdx !== null && hoverPos && (
          <div
            style={{
              position: 'absolute',
              top: Math.max(10, Math.min(H - 120, hoverPos.y - 40)),
              left: hoverPos.x > 320 ? hoverPos.x - 210 : hoverPos.x + 15,
              pointerEvents: 'none',
              background: 'rgba(18, 22, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${t.line}`,
              borderRadius: 10,
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              zIndex: 50,
              minWidth: 180,
            }}
          >
            <div style={{ fontSize: 11, color: t.textFaint, fontFamily: fontMono, marginBottom: 6 }}>
              Timestamp: {hoveredTimestamp || 'Live'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {chartArea.outcomePaths.map(({ outcome, points, isHidden }) => {
                if (isHidden || !points[hoveredIdx]) return null;
                const val = points[hoveredIdx].value;
                return (
                  <div key={outcome.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: outcome.color }} />
                      <span style={{ color: t.text, fontWeight: 600, fontFamily: fontBody }}>{outcome.name}</span>
                    </div>
                    <span style={{ fontFamily: fontMono, fontWeight: 700, color: outcome.color, marginLeft: 12 }}>
                      {val.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
