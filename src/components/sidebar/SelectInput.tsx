interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SelectInput({ label, value, onChange, options }: SelectInputProps) {
  return (
    <label className="flex items-center justify-between gap-3 group">
      <span className="text-[13px] text-gray-300 font-medium group-hover:text-gray-200 transition-colors">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-input text-gray-100 px-2.5 py-1.5 rounded-md border border-border-subtle text-sm font-body focus:border-amber-warm/50 focus:outline-none transition-colors"
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
