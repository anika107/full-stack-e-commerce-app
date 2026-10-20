import { NavSelect } from "@/components/ui/nav-select";

const OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

// Navigates with ?range=... so the server component re-renders with the new
// window — no client-side data fetching needed.
export function RangeSelect({ range }: { range: string }) {
  return <NavSelect param="range" value={range} options={OPTIONS} ariaLabel="Date range" />;
}
