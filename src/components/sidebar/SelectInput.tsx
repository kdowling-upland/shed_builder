interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <label className="property-row">
      <span className="text-[11px] text-text-secondary font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-surface-input text-text-primary px-2 py-1 rounded-sm border border-border-subtle text-[11px] font-body focus:border-accent focus:outline-none transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
