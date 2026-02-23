"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";

interface AppHeaderProps {
  userInitials: string
  userName?: string
  userEmail?: string
}

export function AppHeader({ userInitials, userName, userEmail }: AppHeaderProps) {
  const router = useRouter()

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = (formData.get('search') as string)?.trim()
    if (!query) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/50 bg-background/95 backdrop-blur px-4">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4 mx-1" />

      <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            name="search"
            type="search"
            placeholder="Search contacts, deals, organizations..."
            className="pl-9 h-8 text-sm bg-muted/50 border-transparent focus-visible:border-border focus-visible:bg-background"
          />
        </div>
      </form>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-7 w-7 cursor-pointer ring-1 ring-border hover:ring-primary/50 transition-all">
            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="py-2">
            {userName && (
              <p className="text-sm font-semibold text-foreground leading-tight">{userName}</p>
            )}
            {userEmail && (
              <p className="text-xs text-muted-foreground/70 font-normal mt-0.5 leading-tight truncate">
                {userEmail}
              </p>
            )}
            {!userName && !userEmail && (
              <p className="text-sm font-semibold text-foreground">Account</p>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOut} className="w-full">
              <button
                type="submit"
                className="w-full text-left text-sm cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Log out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
