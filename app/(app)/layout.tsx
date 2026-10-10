import { Suspense } from "react";
import { BottomTabs } from "@/components/shell/BottomTabs";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";

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
        <div className="mx-auto w-full max-w-[1040px]">
          <Suspense>{children}</Suspense>
        </div>
      </main>
      <Suspense>
        <BottomTabs />
      </Suspense>
    </div>
  );
}
