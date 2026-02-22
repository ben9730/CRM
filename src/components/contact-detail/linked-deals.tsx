"use client";

import { Briefcase, TrendingUp, Calendar } from "lucide-react";

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export interface ContactDeal {
  id: string;
  title: string;
  value: number | null;
  currency: string;
  expected_close: string | null;
  stage_name: string;
  stage_color: string | null;
}

interface LinkedDealsProps {
  deals: ContactDeal[];
}

export function LinkedDeals({ deals }: LinkedDealsProps) {
  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

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
                background: "oklch(0.65 0.24 280 / 12%)",
                border: "1px solid oklch(0.65 0.24 280 / 20%)",
              }}
            >
              <Briefcase className="h-3.5 w-3.5" style={{ color: "oklch(0.65 0.24 280)" }} />
            </div>
            <span className="text-sm font-semibold text-foreground/90">Linked Deals</span>
          </div>
          <div className="flex items-center gap-3">
            {deals.length > 0 && totalValue > 0 && (
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.65 0.18 150)" }}
              >
                {formatCurrency(totalValue)} total
              </span>
            )}
            <span
              className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded text-[10px] font-bold tabular-nums"
              style={{
                background: "oklch(0.65 0.24 280 / 12%)",
                color: "oklch(0.65 0.24 280)",
                border: "1px solid oklch(0.65 0.24 280 / 20%)",
              }}
            >
              {deals.length}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.65 0.24 280 / 5%)",
                border: "1px solid oklch(0.65 0.24 280 / 10%)",
              }}
            >
              <Briefcase className="h-5 w-5" style={{ color: "oklch(0.65 0.24 280 / 30%)" }} />
            </div>
            <p className="text-sm text-muted-foreground">No linked deals</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {deals.map((deal) => {
              const closeDate = deal.expected_close
                ? new Date(deal.expected_close).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={deal.id}
                  className="glow-card relative rounded-lg overflow-hidden group cursor-default pl-[3px]"
                >
                  {/* Left colored border */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{
                      background: deal.stage_color ?? "oklch(0.65 0.24 280)",
                    }}
                  />

                  <div
                    className="flex items-center justify-between gap-3 px-3.5 py-3.5"
                    style={{
                      background: deal.stage_color
                        ? `${deal.stage_color}15`
                        : "oklch(0.65 0.24 280 / 6%)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: deal.stage_color ?? "oklch(0.65 0.24 280)",
                          }}
                        />
                        <p className="text-sm font-medium text-foreground/90 truncate">
                          {deal.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 ml-3.5">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            background: deal.stage_color
                              ? `${deal.stage_color}20`
                              : "oklch(0.65 0.24 280 / 10%)",
                            color: deal.stage_color ?? "oklch(0.65 0.20 280)",
                            border: `1px solid ${deal.stage_color ? `${deal.stage_color}40` : "oklch(0.65 0.24 280 / 25%)"}`,
                          }}
                        >
                          {deal.stage_name}
                        </span>
                        {closeDate && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />
                            {closeDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Value display */}
                    {deal.value !== null && (
                      <div className="flex-shrink-0 text-right">
                        <p
                          className="text-base font-bold tabular-nums"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.85 0.05 280), oklch(0.97 0 0))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {formatCurrency(deal.value, deal.currency)}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <TrendingUp
                            className="h-2.5 w-2.5"
                            style={{ color: "oklch(0.65 0.18 150)" }}
                          />
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: "oklch(0.65 0.18 150)" }}
                          >
                            pipeline
                          </span>
                        </div>
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
