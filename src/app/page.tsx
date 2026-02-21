"use client";

import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { TasksWidget } from "@/components/dashboard/tasks-widget";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function DashboardPage() {
  return (
    <div className="min-h-screen space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="animate-fade-in opacity-0">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground/95">
            Dashboard
          </h1>
          <span className="text-sm text-muted-foreground/60 font-mono tracking-widest uppercase">
            Overview
          </span>
        </div>
        <p className="text-sm text-muted-foreground/70 mt-1.5 font-light">
          Pipeline health, open tasks, and recent activity — all in one view.
        </p>
      </div>

      {/* Row 1: Metrics bar */}
      <div className="animate-fade-in animate-delay-1 opacity-0">
        <MetricsCards />
      </div>

      {/* Row 2: Pipeline summary + Tasks widget */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 animate-fade-in animate-delay-2 opacity-0">
        <div className="lg:col-span-2">
          <PipelineSummary />
        </div>
        <div className="lg:col-span-1">
          <TasksWidget />
        </div>
      </div>

      {/* Row 3: Activity feed */}
      <div className="animate-fade-in animate-delay-3 opacity-0">
        <ActivityFeed />
      </div>
    </div>
  );
}
