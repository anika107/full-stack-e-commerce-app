import { Icon } from "../icons";

export function Select({
  options,
  defaultValue,
  ariaLabel,
}: {
  options: { value: string; label: string }[];
  defaultValue?: string;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        defaultValue={defaultValue ?? options[0]?.value}
        className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-700 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
      />
    </div>
  );
}
