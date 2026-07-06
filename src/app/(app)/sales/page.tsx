import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { SalesBoard } from "@/components/sales/SalesBoard";

export default function SalesPage() {
  return (
    <>
      <PageHeader
        title="Sales & Lead Pipeline"
        subtitle="A flexible, Notion-style pipeline. Won & Active leads sync to the newsletter lists automatically."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent to-accent/70 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(249,83,56,0.8)] transition-transform hover:scale-[1.03]">
            <Plus className="size-4" /> New lead
          </button>
        }
      />
      <SalesBoard />
    </>
  );
}
