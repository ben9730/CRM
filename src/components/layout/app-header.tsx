"use client";

import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/50 bg-background/95 backdrop-blur px-4">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-4 mx-1" />

      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search contacts, deals, organizations..."
            className="pl-9 h-8 text-sm bg-muted/50 border-transparent focus-visible:border-border focus-visible:bg-background"
          />
        </div>
      </div>

      <Avatar className="h-7 w-7 cursor-pointer ring-1 ring-border hover:ring-primary/50 transition-all">
        <AvatarFallback className="text-xs bg-secondary text-secondary-foreground font-medium">
          JD
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
