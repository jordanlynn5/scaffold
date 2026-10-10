import { Logo } from "@/components/ui/Logo";

// Sign-up and log-in are not in the design handoff (§13 #12). They use its
// standard card, input and primary button on blueprint grid paper.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-navy px-5 py-3 desk:px-10 desk:py-4">
        <Logo size={30} />
      </header>
      <main className="bg-grid-paper flex flex-1 items-start justify-center px-4 py-8 desk:items-center desk:py-12">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  );
}
