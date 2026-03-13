import { useRef } from 'react';

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
  const sliderRef = useRef<HTMLInputElement>(null);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (Number.isNaN(raw)) return;
    onChange(Math.min(max, Math.max(min, raw)));
  };

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="group space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-gray-300 font-medium group-hover:text-gray-200 transition-colors">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={handleTextChange}
            min={min}
            max={max}
            step={step}
            className="w-14 bg-surface-input text-gray-100 px-1.5 py-0.5 rounded border border-border-subtle text-xs text-right font-body tabular-nums focus:border-amber-warm/50 focus:outline-none transition-colors"
          />
          {unit && <span className="text-[11px] text-gray-500 w-5 font-medium">{unit}</span>}
        </div>
      </div>
      <input
        ref={sliderRef}
        type="range"
        value={value}
        onChange={handleSlider}
        min={min}
        max={max}
        step={step}
        className="slider-input w-full"
        style={{ '--slider-pct': `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
}
