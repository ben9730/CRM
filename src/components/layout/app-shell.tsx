import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { getOverdueTaskCount } from "@/lib/queries/tasks";
import { createClient } from "@/lib/supabase/server";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient()

  // Fetch overdue task count and user profile in parallel
  let overdueCount = 0
  let userInitials = 'U'

  try {
    const [taskCount, { data: { user } }] = await Promise.all([
      getOverdueTaskCount(),
      supabase.auth.getUser(),
    ])

    overdueCount = taskCount

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const name = profile?.full_name || user.email || ''
      const parts = name.split(/[\s@]+/).filter(Boolean)
      userInitials =
        parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : (parts[0]?.[0] ?? 'U').toUpperCase()
    }
  } catch {
    // Not critical — sidebar badge and initials are optional
  }

  return (
    <SidebarProvider>
      <AppSidebar overdueTaskCount={overdueCount} />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AppHeader userInitials={userInitials} />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
