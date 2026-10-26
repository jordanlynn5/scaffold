import { Suspense } from "react";
import { BottomTabs } from "@/components/shell/BottomTabs";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { CelebrationGate } from "@/components/celebrations/CelebrationGate";

// The frame around every screen behind log-in (handoff §3): a sidebar at
// 700px and above, a top bar plus bottom tabs below it.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col desk:flex-row">
      <Suspense>
        <Sidebar />
        <TopBar />
      </Suspense>
      <main className="flex-1 px-4 pt-5 pb-28 desk:px-10 desk:py-9">
        {/* About 1040px (handoff §3.1), growing on very wide screens so pages
            don't float in grey space. Fluid, so no second breakpoint. */}
        <div className="mx-auto w-full max-w-[clamp(1040px,80vw,1440px)]">
          <Suspense>{children}</Suspense>
        </div>
      </main>
      <Suspense>
        <BottomTabs />
      </Suspense>
      <Suspense>
        <CelebrationGate />
      </Suspense>
    </div>
  );
}
