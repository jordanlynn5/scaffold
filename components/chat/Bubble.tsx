import type { ReactNode } from "react";

// Handoff §4.5
export function TeamBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[82%] self-start whitespace-pre-line rounded-[4px_16px_16px_16px] border border-line bg-surface px-4 py-3 text-body">
      {children}
    </div>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[82%] self-end whitespace-pre-line rounded-[16px_16px_4px_16px] bg-navy px-4 py-3 text-body text-surface">
      {children}
    </div>
  );
}
