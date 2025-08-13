import React from 'react';
import { PRHistoryItem } from '../types';

interface LineGraphProps {
  data: PRHistoryItem[];
}

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 bg-gray-800/30 rounded-lg">
        Record at least two PRs to see your progression.
      </div>
    );
  }

  const width = 500;
  const height = 150;
  const padding = 20;
  const yAxisLabelPadding = 30;
  const xAxisLabelPadding = 20;

  const maxPR = Math.max(...data.map(p => p.pr));
  const minPR = Math.min(...data.map(p => p.pr));

  const getX = (index: number) => {
    return (index / (data.length - 1)) * (width - yAxisLabelPadding - padding) + yAxisLabelPadding;
  };
  
  const getY = (pr: number) => {
    const range = maxPR - minPR;
    if (range === 0) return (height - xAxisLabelPadding) / 2;
    return height - xAxisLabelPadding - ((pr - minPR) / range) * (height - padding - xAxisLabelPadding);
  };

  const pathData = data.map((point, i) => {
    const x = getX(i);
    const y = getY(point.pr);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  const areaData = `${pathData} V ${height - xAxisLabelPadding} H ${getX(0)} Z`;

  return (
    <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title">
        <title id="chart-title">A line graph showing push-up PR progression over time.</title>
        <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(192, 132, 252, 0.4)" />
            <stop offset="100%" stopColor="rgba(192, 132, 252, 0)" />
            </linearGradient>
        </defs>

        {/* Y-axis labels and grid lines */}
        <g className="text-gray-500">
            {[maxPR, minPR].map((pr, index) => {
                const y = getY(pr);
                return (
                    <g key={index}>
                        <text x={yAxisLabelPadding - 8} y={y + 3} fill="currentColor" fontSize="10" textAnchor="end">{pr}</text>
                        <line x1={yAxisLabelPadding} x2={width} y1={y} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,3" />
                    </g>
                )
            })}
        </g>
        
        {/* Area under line */}
        <path d={areaData} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={pathData} fill="none" stroke="#c084fc" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        
        {/* Data points */}
        {data.map((point, i) => (
            <circle key={i} cx={getX(i)} cy={getY(point.pr)} r="3.5" fill="#111827" stroke="#c084fc" strokeWidth="2" />
        ))}
        </svg>
    </div>
  );
};

export default LineGraph;
