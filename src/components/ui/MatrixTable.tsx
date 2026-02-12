'use client';

import React from 'react';

interface MatrixTableProps {
  data: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  title?: string;
  highlightMax?: boolean;
  colorScale?: boolean;
  compact?: boolean;
}

export function MatrixTable({ data, rowLabels, colLabels, title, highlightMax, colorScale, compact }: MatrixTableProps) {
  const getColor = (val: number, row: number[]) => {
    if (highlightMax) {
      const max = Math.max(...row);
      if (val === max) return 'bg-green-200 font-bold';
    }
    if (colorScale) {
      const abs = Math.abs(val);
      if (val > 0.3) return 'bg-blue-200';
      if (val > 0.1) return 'bg-blue-100';
      if (val < -0.3) return 'bg-red-200';
      if (val < -0.1) return 'bg-red-100';
      if (abs < 0.05) return 'bg-gray-100';
    }
    return '';
  };

  const fontSize = compact ? 'text-[10px]' : 'text-xs';

  return (
    <div className="overflow-x-auto">
      {title && <p className="text-sm font-semibold mb-2">{title}</p>}
      <table className="border-collapse">
        <thead>
          {colLabels && (
            <tr>
              {rowLabels && <th className={`${fontSize} p-1`}></th>}
              {colLabels.map((label, i) => (
                <th key={i} className={`${fontSize} p-1 text-center text-muted-foreground font-normal`}>
                  {label}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {rowLabels && (
                <td className={`${fontSize} p-1 pr-2 font-semibold text-right whitespace-nowrap`}>
                  {rowLabels[i]}
                </td>
              )}
              {row.map((val, j) => (
                <td
                  key={j}
                  className={`${fontSize} p-1 text-center font-mono border border-border/30 min-w-[48px] ${getColor(val, row)}`}
                >
                  {compact ? val.toFixed(2) : val.toFixed(4)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
