"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { mockDeals, PIPELINE_STAGES, Deal, PipelineStage } from "@/data/mock-deals";
import { KanbanColumn } from "./kanban-column";
import { DealCard } from "./deal-card";

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) ?? null : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target stage
    const targetStage = PIPELINE_STAGES.includes(overId as PipelineStage)
      ? (overId as PipelineStage)
      : deals.find((d) => d.id === overId)?.stage;

    if (!targetStage) return;

    const activeDeal = deals.find((d) => d.id === activeId);
    if (!activeDeal || activeDeal.stage === targetStage) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === activeId ? { ...d, stage: targetStage } : d))
    );
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a column header (droppable id = stage name)
    const targetStage = PIPELINE_STAGES.includes(overId as PipelineStage)
      ? (overId as PipelineStage)
      : deals.find((d) => d.id === overId)?.stage;

    if (!targetStage) return;

    setDeals((prev) => {
      const activeDealIdx = prev.findIndex((d) => d.id === activeId);
      const overDealIdx = prev.findIndex((d) => d.id === overId);

      const updated = prev.map((d) =>
        d.id === activeId ? { ...d, stage: targetStage } : d
      );

      // Reorder within same column for visual consistency
      if (activeDealIdx !== -1 && overDealIdx !== -1 && activeDealIdx !== overDealIdx) {
        return arrayMove(updated, activeDealIdx, overDealIdx);
      }

      return updated;
    });
  }

  const dealsByStage = PIPELINE_STAGES.reduce<Record<string, Deal[]>>((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage);
    return acc;
  }, {});

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 h-full overflow-x-auto overflow-y-hidden px-6 py-5 pb-6">
        {PIPELINE_STAGES.map((stage, index) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage] ?? []}
            animationDelay={index * 60}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDeal ? <DealCard deal={activeDeal} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
