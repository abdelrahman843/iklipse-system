import { PageHeader } from "@/components/shell/PageHeader";
import { SopLibrary } from "@/components/sop/SopLibrary";

export default function SopPage() {
  return (
    <>
      <PageHeader
        title="SOP Library"
        subtitle="The single source of truth for how Iklipse operates. Quiz-gated SOPs require a passing score before they unlock."
      />
      <SopLibrary />
    </>
  );
}
