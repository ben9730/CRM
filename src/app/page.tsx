"use client";

import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { TasksWidget } from "@/components/dashboard/tasks-widget";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your sales overview — pipeline, tasks, and recent activity.
        </p>
      </div>

      {/* Row 1: Metrics bar */}
      <MetricsCards />

      {/* Row 2: Pipeline summary + Tasks widget */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PipelineSummary />
        </div>
        <div className="lg:col-span-1">
          <TasksWidget />
        </div>
      </div>

      {/* Row 3: Activity feed */}
      <ActivityFeed />
    </div>
  );
}
