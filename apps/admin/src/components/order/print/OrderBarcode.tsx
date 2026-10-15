import React, { useMemo } from 'react';
import type { OrderBarcodeProps } from './printTypes';

export const OrderBarcode: React.FC<OrderBarcodeProps> = ({
  value,
  height = 42,
  showText = true,
}) => {
  const bars = useMemo(() => {
    const cleanStr = (value || '000000')
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '');
    const patternList: number[] = [];

    // Quiet zone start
    patternList.push(1, 0, 1, 0);

    for (let i = 0; i < cleanStr.length; i++) {
      const charCode = cleanStr.charCodeAt(i);
      const seed = (charCode * (i + 1) * 7) % 16;

      const b1 = seed & 1 ? 2 : 1;
      const s1 = seed & 2 ? 1 : 2;
      const b2 = seed & 4 ? 3 : 1;
      const s2 = seed & 8 ? 1 : 2;
      const b3 = (seed + i) % 2 === 0 ? 2 : 1;

      patternList.push(b1, s1, b2, s2, b3, 1);
    }

    // Stop pattern
    patternList.push(2, 1, 1, 0, 2);
    return patternList;
  }, [value]);

  const totalWidth = useMemo(() => {
    return bars.reduce((acc, curr) => acc + curr, 0);
  }, [bars]);

  let currentX = 0;

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[280px]"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
      >
        {bars.map((barWidth, index) => {
          const isBar = index % 2 === 0;
          const x = currentX;
          currentX += barWidth;

          if (!isBar) return null;

          return (
            <rect
              key={index}
              x={x}
              y={0}
              width={barWidth}
              height={height}
              fill="#000000"
            />
          );
        })}
      </svg>
      {showText && (
        <span className="font-mono text-[11px] font-bold tracking-widest text-black mt-1 uppercase">
          *{value}*
        </span>
      )}
    </div>
  );
};
