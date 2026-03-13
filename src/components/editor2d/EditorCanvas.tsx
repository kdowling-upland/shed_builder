import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import { useShedStore } from '../../store/useShedStore.ts';
import { OpeningItem } from './OpeningItem.tsx';
import { DimensionLabel } from './DimensionLabel.tsx';
import { useMemo, useState, useEffect, useRef, type ReactNode } from 'react';

const BG_COLOR = '#0c0e12';
const FLOOR_COLOR = '#141820';
const FLOOR_STROKE = '#3a4050';
const WALL_COLOR = '#8a9ab0';
const GRID_MAJOR = '#1a1e27';
const GRID_MINOR = '#12151b';
const LABEL_COLOR = '#5a6478';

export function EditorCanvas() {
  const design = useShedStore((s) => s.design);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, length, openings } = design;

  // Calculate scale to fit shed in canvas with padding
  const padding = 100;
  const availW = size.width - padding * 2;
  const availH = size.height - padding * 2;
  const scale = Math.min(availW / width, availH / length, 50);

  const shedW = width * scale;
  const shedH = length * scale;
  const originX = (size.width - shedW) / 2;
  const originY = (size.height - shedH) / 2;

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: ReactNode[] = [];
    // 1-foot grid inside shed
    for (let x = 0; x <= width; x++) {
      lines.push(
        <Line
          key={`vg-${x}`}
          points={[originX + x * scale, originY, originX + x * scale, originY + shedH]}
          stroke={x % 4 === 0 ? GRID_MAJOR : GRID_MINOR}
          strokeWidth={x % 4 === 0 ? 1 : 0.5}
        />
      );
    }
    for (let y = 0; y <= length; y++) {
      lines.push(
        <Line
          key={`hg-${y}`}
          points={[originX, originY + y * scale, originX + shedW, originY + y * scale]}
          stroke={y % 4 === 0 ? GRID_MAJOR : GRID_MINOR}
          strokeWidth={y % 4 === 0 ? 1 : 0.5}
        />
      );
    }
    return lines;
  }, [width, length, scale, originX, originY, shedW, shedH]);

  return (
    <div ref={containerRef} className="w-full h-full bg-surface-dark">
      <Stage width={size.width} height={size.height}>
        <Layer>
          {/* Background */}
          <Rect x={0} y={0} width={size.width} height={size.height} fill={BG_COLOR} />

          {/* Grid */}
          {gridLines}

          {/* Floor */}
          <Rect
            x={originX}
            y={originY}
            width={shedW}
            height={shedH}
            fill={FLOOR_COLOR}
            stroke={FLOOR_STROKE}
            strokeWidth={1}
          />

          {/* Walls (thick lines) */}
          <Group>
            {/* Front wall */}
            <Line
              points={[originX, originY, originX + shedW, originY]}
              stroke={WALL_COLOR}
              strokeWidth={5}
              lineCap="round"
            />
            {/* Back wall */}
            <Line
              points={[originX, originY + shedH, originX + shedW, originY + shedH]}
              stroke={WALL_COLOR}
              strokeWidth={5}
              lineCap="round"
            />
            {/* Left wall */}
            <Line
              points={[originX, originY, originX, originY + shedH]}
              stroke={WALL_COLOR}
              strokeWidth={5}
              lineCap="round"
            />
            {/* Right wall */}
            <Line
              points={[originX + shedW, originY, originX + shedW, originY + shedH]}
              stroke={WALL_COLOR}
              strokeWidth={5}
              lineCap="round"
            />
          </Group>

          {/* Wall labels */}
          <Text x={originX + shedW / 2 - 15} y={originY - 28} text="Front" fill={LABEL_COLOR} fontSize={11} fontFamily="DM Sans" fontStyle="500" />
          <Text x={originX + shedW / 2 - 15} y={originY + shedH + 14} text="Back" fill={LABEL_COLOR} fontSize={11} fontFamily="DM Sans" fontStyle="500" />
          <Text x={originX - 32} y={originY + shedH / 2 - 6} text="Left" fill={LABEL_COLOR} fontSize={11} fontFamily="DM Sans" fontStyle="500" />
          <Text x={originX + shedW + 10} y={originY + shedH / 2 - 6} text="Right" fill={LABEL_COLOR} fontSize={11} fontFamily="DM Sans" fontStyle="500" />

          {/* Dimension labels */}
          <DimensionLabel
            x1={originX}
            y1={originY}
            x2={originX + shedW}
            y2={originY}
            label={`${width}'`}
            offset={-40}
          />
          <DimensionLabel
            x1={originX}
            y1={originY}
            x2={originX}
            y2={originY + shedH}
            label={`${length}'`}
            offset={40}
          />

          {/* Openings */}
          {openings.map((opening) => (
            <OpeningItem
              key={opening.id}
              opening={opening}
              scale={scale}
              shedWidth={width}
              shedLength={length}
              originX={originX}
              originY={originY}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
