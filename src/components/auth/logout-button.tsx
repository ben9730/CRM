'use client'

import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function LogoutButton() {
  return (
    <form action={signOut}>
      <SidebarMenuButton
        type="submit"
        tooltip="Log out"
        className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span>Log out</span>
      </SidebarMenuButton>
    </form>
  )
}
