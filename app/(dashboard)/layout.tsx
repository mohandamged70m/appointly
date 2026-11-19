import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentUser } from "@/lib/auth-session";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col px-4 py-6 md:px-8">
          <Suspense
            fallback={
              <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
                Loading your workspace...
              </div>
            }
          >
            <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

async function AuthenticatedDashboard({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return children;
}
