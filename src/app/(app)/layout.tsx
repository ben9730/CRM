import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      <Toaster position="bottom-left" theme="dark" />
      <ChatWidget />
    </AppShell>
  );
}
