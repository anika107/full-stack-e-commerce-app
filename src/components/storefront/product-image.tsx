import { Icon, type IconName } from "@/components/admin/icons";

// The schema has no image field, so products get a deterministic category
// visual: a soft duotone gradient + category glyph. Swap for real images by
// rendering an <img> here once a product imageUrl column exists.

const CATEGORY_STYLE: Record<string, { icon: IconName; from: string; to: string }> = {
  Audio: { icon: "speaker", from: "#eef2ff", to: "#c7d2fe" },
  Wearables: { icon: "watch", from: "#e0f2fe", to: "#a5d8f8" },
  "Smart Home": { icon: "home", from: "#fef3c7", to: "#fcd34d" },
  Accessories: { icon: "plug", from: "#d1fae5", to: "#86e3b4" },
  Gaming: { icon: "gamepad", from: "#ede9fe", to: "#c9b8fb" },
  Cameras: { icon: "camera", from: "#ffe4e6", to: "#fda4af" },
};

const FALLBACK = { icon: "tags" as IconName, from: "#f5f5f4", to: "#d6d3d1" };

export function ProductImage({
  category,
  name,
  className = "",
}: {
  category: string;
  name: string;
  className?: string;
}) {
  const style = CATEGORY_STYLE[category] ?? FALLBACK;
  return (
    <div
      role="img"
      aria-label={name}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(140deg, ${style.from}, ${style.to})` }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.8) 0 3px, transparent 4px)",
          backgroundSize: "34px 34px",
        }}
      />
      <span
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm"
        style={{ color: "rgba(28,25,23,0.55)" }}
      >
        <Icon name={style.icon} className="h-12 w-12" />
      </span>
    </div>
  );
}
