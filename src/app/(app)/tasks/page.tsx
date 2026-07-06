import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { TaskBoard } from "@/components/tasks/TaskBoard";

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks & Delivery"
        subtitle="Every internal and client task. Buffers auto-applied from the final client deadline - 30% team-visible, 30% private."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent to-accent/70 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(249,83,56,0.8)] transition-transform hover:scale-[1.03]">
            <Plus className="size-4" /> New task
          </button>
        }
      />
      <TaskBoard />
    </>
  );
}
