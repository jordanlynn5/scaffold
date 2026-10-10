import { Suspense } from "react";

// Screens that fill the whole window with their own header instead of the
// menu, so nothing competes with the conversation (handoff §6.4).
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return <Suspense>{children}</Suspense>;
}
