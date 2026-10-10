// Line icons from the handoff §4.10: 24×24, stroke 2, round caps and joins.
const paths = {
  home: "M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6",
  progress: "M5 20V11 M12 20V4 M19 20v-6",
  plan: "M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4",
  team: "M4 5h16v11H9l-5 4z",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8z M4 21c0-4 4-6 8-6s8 2 8 6",
  send: "M5 12h14 M13 6l6 6-6 6",
  check: "M5 12l5 5 9-10",
  forward: "M4 12h13 M12 7l5 5-5 5 M20 5v14",
  camera: "M4 8h3l2-3h6l2 3h3v11H4z M12 16a3 3 0 100-6 3 3 0 000 6z",
  pencil: "M4 20l1-4L16 5l3 3L8 19z M14 7l3 3",
  lock: "M6 11h12v9H6z M8 11V8a4 4 0 018 0v3",
  trophy: "M8 4h8v5a4 4 0 01-8 0z M8 6H5a3 3 0 003 4 M16 6h3a3 3 0 01-3 4 M12 13v4 M8 20h8",
  warning: "M12 4l9 16H3z M12 10v4 M12 17v.5",
  scissors: "M6 9a3 3 0 100-6 3 3 0 000 6z M6 21a3 3 0 100-6 3 3 0 000 6z M8 8l12 10 M8 16L20 6",
  "chevron-down": "M6 9l6 6 6-6",
  "chevron-up": "M6 15l6-6 6 6",
  "chevron-right": "M9 6l6 6-6 6",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18z M12 16a4 4 0 100-8 4 4 0 000 8z M12 12h.01",
  heart: "M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.500-7 10-7 10z",
  house: "M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6",
  scaffold: "M4 21V5 M20 21V5 M3 9h18 M3 15h18 M4 15l4-6",
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 22,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
