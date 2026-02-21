"use client";

import { mockTasks } from "@/data/mock-tasks";
import type { TaskPriority } from "@/data/mock-tasks";
import { AlertTriangle, Circle } from "lucide-react";

function formatDueDate(dateStr: string): { label: string; overdue: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return { label: `${Math.abs(diff)}d overdue`, overdue: true };
  }
  if (diff === 0) return { label: "Due today", overdue: false };
  if (diff === 1) return { label: "Tomorrow", overdue: false };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overdue: false,
  };
}

const PRIORITY_BORDER: Record<TaskPriority, string> = {
  high: "oklch(0.55 0.22 25)",
  medium: "oklch(0.65 0.24 280)",
  low: "oklch(0.40 0.05 280)",
};

const PRIORITY_LABEL_COLOR: Record<TaskPriority, string> = {
  high: "text-red-400/80",
  medium: "text-primary/80",
  low: "text-muted-foreground/50",
};

export function TasksWidget() {
  const today = new Date().toISOString().split("T")[0];

  const tasks = mockTasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => {
      const aOverdue = a.dueDate < today;
      const bOverdue = b.dueDate < today;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      // Within same group: high priority first, then by date
      const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 6);

  const overdueCount = tasks.filter((t) => t.dueDate < today).length;

  return (
    <div className="glow-card gradient-border-top bg-noise rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Tasks
          </h2>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-400/70" />
              <span className="text-[10px] font-semibold text-red-400/70 tabular-nums">
                {overdueCount} overdue
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task list — flat, no card wrapper */}
      <div className="flex-1 px-5 py-2">
        {tasks.map((task, idx) => {
          const { label, overdue } = formatDueDate(task.dueDate);
          const borderColor = PRIORITY_BORDER[task.priority];
          const isLast = idx === tasks.length - 1;

          return (
            <div
              key={task.id}
              className={`group/task flex items-start gap-3 py-3 transition-colors duration-150 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg cursor-default ${
                !isLast ? "border-b border-border/10" : ""
              }`}
            >
              {/* Left color accent bar */}
              <div
                className="mt-1 flex-shrink-0 w-0.5 self-stretch rounded-full opacity-70"
                style={{ background: borderColor, minHeight: "2rem" }}
              />

              {/* Status indicator */}
              <div className="mt-[3px] flex-shrink-0">
                {overdue ? (
                  <AlertTriangle className="h-3 w-3 text-red-400/70" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/25" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[13px] font-medium leading-snug truncate transition-colors duration-150 ${
                    overdue
                      ? "text-red-300/80"
                      : "text-foreground/80 group-hover/task:text-foreground/95"
                  }`}
                >
                  {task.title}
                </p>
                {task.contactName && (
                  <p className="text-[11px] text-muted-foreground/45 mt-0.5 truncate">
                    {task.contactName}
                    {task.dealName ? (
                      <span className="text-muted-foreground/30"> · {task.dealName}</span>
                    ) : null}
                  </p>
                )}
              </div>

              {/* Right: due date + priority */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className={`text-[10px] font-medium tabular-nums ${
                    overdue
                      ? "text-red-400/80 font-semibold"
                      : "text-muted-foreground/45"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider ${
                    PRIORITY_LABEL_COLOR[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
