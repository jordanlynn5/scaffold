// Handoff §4.4. Teammates have a name and an initial badge, never a drawing.
export const teammates = {
  alice: { name: "Alice", role: "Architect", initial: "A" },
  georgina: { name: "Georgina", role: "General Contractor", initial: "G" },
  paula: { name: "Paula", role: "Project Manager", initial: "P" },
  sarah: { name: "Sarah", role: "Site Lead", initial: "S" },
} as const;

export type TeammateId = keyof typeof teammates;

export function TeammateBadge({
  who,
  size = 32,
}: {
  who: TeammateId;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-badge bg-navy font-heading font-bold text-yellow"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {teammates[who].initial}
    </span>
  );
}

// Always written "Name · Role".
export function TeammateLabel({ who }: { who: TeammateId }) {
  const t = teammates[who];
  return (
    <span className="text-[13px] font-semibold text-navy">
      {t.name} · {t.role}
    </span>
  );
}
