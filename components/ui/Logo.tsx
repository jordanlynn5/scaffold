import { Icon } from "./Icon";

// Handoff §3.1 / §3.2: yellow rounded square with the scaffold mark.
export function Logo({ size = 34, onNavy = true }: { size?: number; onNavy?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center rounded-badge bg-yellow text-ink"
        style={{ width: size, height: size }}
      >
        <Icon name="scaffold" size={size * 0.62} />
      </span>
      <span
        className={`font-heading font-bold ${onNavy ? "text-surface" : "text-ink"}`}
        style={{ fontSize: size > 30 ? 22 : 20 }}
      >
        Scaffold
      </span>
    </span>
  );
}
