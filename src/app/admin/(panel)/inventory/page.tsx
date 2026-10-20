import type { Metadata } from "next";
import { Suspense } from "react";
import { getInventory } from "@/lib/services";
import { InventoryTable } from "@/components/admin/inventory-table";
import { Button } from "@/components/admin/ui/button";
import { Icon } from "@/components/admin/icons";
import { PageHeader } from "@/components/admin/ui/page-header";
import { InventorySkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return (
    <Suspense fallback={<InventorySkeleton />}>
      <Inventory />
    </Suspense>
  );
}

async function Inventory() {
  const rows = await getInventory();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels across your catalog."
        actions={
          <Button variant="secondary">
            <Icon name="plus" className="h-4 w-4" />
            Adjust stock
          </Button>
        }
      />
      <InventoryTable rows={rows} />
    </div>
  );
}
