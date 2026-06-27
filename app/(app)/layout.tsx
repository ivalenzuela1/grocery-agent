import { AppHeader } from "@/components/AppHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-5">
        {children}
      </main>
    </>
  );
}
