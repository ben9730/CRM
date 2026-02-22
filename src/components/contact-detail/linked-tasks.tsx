"use client";

import { CheckSquare, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

const PRIORITY_CONFIG: Record<
  string,
  { borderOklch: string; labelOklch: string; bgOklch: string }
> = {
  high: {
    borderOklch: "oklch(0.55 0.22 25 / 60%)",
    labelOklch: "oklch(0.60 0.20 25)",
    bgOklch: "oklch(0.55 0.22 25 / 8%)",
  },
  medium: {
    borderOklch: "oklch(0.65 0.24 280 / 60%)",
    labelOklch: "oklch(0.65 0.20 280)",
    bgOklch: "oklch(0.65 0.24 280 / 6%)",
  },
  low: {
    borderOklch: "oklch(1 0 0 / 10%)",
    labelOklch: "oklch(0.50 0 0)",
    bgOklch: "oklch(0.16 0 0)",
  },
};

export interface ContactTask {
  id: string;
  title: string;
  due_date: string | null;
  is_complete: boolean;
  priority: string | null;
  description: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface LinkedTasksProps {
  tasks: ContactTask[];
}

export function LinkedTasks({ tasks }: LinkedTasksProps) {
  const today = new Date().toISOString().split("T")[0];

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.is_complete && !b.is_complete) return 1;
    if (!a.is_complete && b.is_complete) return -1;
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });

  const pendingCount = tasks.filter((t) => !t.is_complete).length;
  const completedCount = tasks.filter((t) => t.is_complete).length;

  return (
    <div
      className="gradient-border-top rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.13 0.005 280)",
        border: "1px solid oklch(1 0 0 / 7%)",
      }}
    >
      {/* Section header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid oklch(1 0 0 / 5%)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{
                background: "oklch(0.65 0.18 150 / 12%)",
                border: "1px solid oklch(0.65 0.18 150 / 20%)",
              }}
            >
              <CheckSquare
                className="h-3.5 w-3.5"
                style={{ color: "oklch(0.65 0.18 150)" }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground/90">Linked Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: "oklch(0.65 0.18 150 / 10%)",
                  color: "oklch(0.65 0.18 150)",
                  border: "1px solid oklch(0.65 0.18 150 / 20%)",
                }}
              >
                {completedCount} done
              </span>
            )}
            <span
              className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[10px] font-bold tabular-nums"
              style={{
                background: "oklch(0.65 0.18 150 / 12%)",
                color: "oklch(0.65 0.18 150)",
                border: "1px solid oklch(0.65 0.18 150 / 20%)",
              }}
            >
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div
            className="mt-3 h-1 rounded-full overflow-hidden"
            style={{ background: "oklch(0.18 0 0)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
                background:
                  "linear-gradient(90deg, oklch(0.55 0.18 150), oklch(0.65 0.20 160))",
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.65 0.18 150 / 5%)",
                border: "1px solid oklch(0.65 0.18 150 / 10%)",
              }}
            >
              <CheckSquare
                className="h-5 w-5"
                style={{ color: "oklch(0.65 0.18 150 / 30%)" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">No linked tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => {
              const isOverdue =
                !task.is_complete && task.due_date && task.due_date < today;
              const isCompleted = task.is_complete;
              const priority = task.priority ?? 'low';
              const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low;

              return (
                <div
                  key={task.id}
                  className="relative rounded-lg overflow-hidden pl-[3px] transition-all duration-200 group"
                  style={{
                    boxShadow: isOverdue
                      ? "0 0 16px -4px oklch(0.55 0.22 25 / 20%)"
                      : "none",
                  }}
                >
                  {/* Left priority border */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{
                      background: isOverdue
                        ? "oklch(0.55 0.22 25)"
                        : isCompleted
                        ? "oklch(0.65 0.18 150 / 40%)"
                        : cfg.borderOklch,
                    }}
                  />

                  <div
                    className="flex items-start gap-3 px-3.5 py-3"
                    style={{
                      background: isOverdue
                        ? "oklch(0.55 0.22 25 / 6%)"
                        : isCompleted
                        ? "oklch(0.14 0 0)"
                        : cfg.bgOklch,
                      border: "1px solid oklch(1 0 0 / 5%)",
                      borderLeft: "none",
                      borderRadius: "0 0.5rem 0.5rem 0",
                    }}
                  >
                    {/* Status icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {isOverdue ? (
                        <AlertCircle
                          className="h-4 w-4"
                          style={{ color: "oklch(0.60 0.22 25)" }}
                        />
                      ) : isCompleted ? (
                        <CheckCircle2
                          className="h-4 w-4"
                          style={{ color: "oklch(0.65 0.18 150)" }}
                        />
                      ) : (
                        <div
                          className="h-4 w-4 rounded border-2"
                          style={{ borderColor: "oklch(0.35 0 0)" }}
                        />
                      )}
                    </div>

                    {/* Task info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-medium truncate"
                        style={{
                          color: isCompleted
                            ? "oklch(0.40 0 0)"
                            : "oklch(0.90 0 0)",
                          textDecoration: isCompleted ? "line-through" : "none",
                        }}
                      >
                        {task.title}
                      </p>
                      {task.due_date && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock
                            className="h-2.5 w-2.5 flex-shrink-0"
                            style={{
                              color: isOverdue
                                ? "oklch(0.60 0.22 25)"
                                : "oklch(0.40 0 0)",
                            }}
                          />
                          <p
                            className="text-[11px] font-medium"
                            style={{
                              color: isOverdue
                                ? "oklch(0.60 0.22 25)"
                                : "oklch(0.45 0 0)",
                            }}
                          >
                            {isOverdue ? "Overdue · " : "Due: "}
                            {formatDate(task.due_date)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Priority badge */}
                    {task.priority && (
                      <div className="flex-shrink-0">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            background: isOverdue
                              ? "oklch(0.55 0.22 25 / 12%)"
                              : isCompleted
                              ? "oklch(0.16 0 0)"
                              : cfg.bgOklch,
                            color: isOverdue
                              ? "oklch(0.60 0.20 25)"
                              : isCompleted
                              ? "oklch(0.35 0 0)"
                              : cfg.labelOklch,
                            border: `1px solid ${
                              isOverdue
                                ? "oklch(0.55 0.22 25 / 30%)"
                                : isCompleted
                                ? "oklch(1 0 0 / 6%)"
                                : cfg.borderOklch
                            }`,
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
