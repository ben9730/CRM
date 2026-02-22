import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { getOverdueTaskCount } from "@/lib/queries/tasks";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  // Fetch overdue task count for sidebar badge (silently ignore errors)
  let overdueCount = 0
  try {
    overdueCount = await getOverdueTaskCount()
  } catch {
    // Not critical — sidebar badge optional
  }

  return (
    <SidebarProvider>
      <AppSidebar overdueTaskCount={overdueCount} />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
