export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: "primary" | "secondary" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";
  return (
    <button
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors ${styles} ${className}`}
      {...props}
    />
  );
}
