"use client";

import { mockTasks } from "@/data/mock-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-muted/50 text-muted-foreground border-border/50",
};

export function TasksWidget() {
  const today = new Date().toISOString().split("T")[0];

  const urgentTasks = mockTasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => {
      // overdue first, then by date
      const aOverdue = a.dueDate < today;
      const bOverdue = b.dueDate < today;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 6);

  return (
    <Card className="border-border/40 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground/90">
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {urgentTasks.map((task, idx) => {
          const isOverdue = task.dueDate < today;
          return (
            <div
              key={task.id}
              className={`flex items-start gap-3 py-2.5 ${
                idx !== urgentTasks.length - 1 ? "border-b border-border/30" : ""
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isOverdue ? (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40 mt-0.5" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className={`text-xs font-medium leading-tight truncate ${isOverdue ? "text-destructive/90" : "text-foreground/90"}`}>
                  {task.title}
                </p>
                {task.contactName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {task.contactName}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 h-4 border ${PRIORITY_STYLES[task.priority]}`}
                >
                  {task.priority}
                </Badge>
                <span className={`text-[10px] ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
