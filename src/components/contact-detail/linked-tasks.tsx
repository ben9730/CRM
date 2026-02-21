"use client";

import { Task } from "@/data/mock-tasks";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, AlertCircle } from "lucide-react";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  low: "bg-muted/50 text-muted-foreground border-border/50",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted/40 text-muted-foreground border-border/40",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface LinkedTasksProps {
  tasks: Task[];
}

export function LinkedTasks({ tasks }: LinkedTasksProps) {
  const today = new Date().toISOString().split("T")[0];

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-5">
      <h2 className="text-sm font-semibold text-foreground/90 mb-4 flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-muted-foreground" />
        Linked Tasks
        <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 h-4 border-border/50 text-muted-foreground">
          {tasks.length}
        </Badge>
      </h2>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
            <CheckSquare className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No linked tasks</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedTasks.map((task) => {
            const isOverdue = task.status !== "completed" && task.dueDate < today;
            return (
              <div
                key={task.id}
                className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 ${
                  isOverdue
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border/30 bg-background/50"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isOverdue ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : task.status === "completed" ? (
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 rounded border-2 border-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    Due: {formatDate(task.dueDate)}
                    {isOverdue ? " (overdue)" : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 border ${PRIORITY_STYLES[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 h-4 border ${STATUS_STYLES[task.status]}`}
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
