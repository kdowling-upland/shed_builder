import { useRef, useCallback } from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function NumberInput({ label, value, onChange, min = 0, max = 100, step = 1, unit }: NumberInputProps) {
  const dragRef = useRef<{ startX: number; startVal: number } | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    onChange(Math.min(max, Math.max(min, raw)));
  };

  const clamp = useCallback((v: number) => {
    const stepped = Math.round(v / step) * step;
    return Math.min(max, Math.max(min, stepped));
  }, [min, max, step]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startVal: value };
  }, [value]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const range = max - min;
    const sensitivity = range / 200;
    onChange(clamp(dragRef.current.startVal + dx * sensitivity));
  }, [onChange, clamp, min, max]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="property-row">
      <span
        className="text-[11px] text-text-secondary font-medium select-none cursor-ew-resize hover:text-text-primary transition-colors"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title="Drag to adjust"
      >
        {label}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          onChange={handleTextChange}
          min={min}
          max={max}
          step={step}
          className="flex-1 min-w-0 text-text-primary px-2 py-1 rounded-sm border border-border-subtle text-[11px] text-right font-body tabular-nums focus:border-accent focus:outline-none transition-colors"
          style={{
            background: `linear-gradient(to right, rgba(58,114,176,0.12) ${pct}%, var(--color-surface-input) ${pct}%)`,
          }}
        />
        {unit && (
          <span className="text-[10px] text-text-muted font-medium w-5 shrink-0 text-left">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
