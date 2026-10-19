import type { Metadata } from "next";
import { Button } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Icon } from "@/components/admin/icons";
import { ProductTable } from "@/components/admin/product-table";

export const metadata: Metadata = { title: "Products" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, and listings."
        actions={
          <Button>
            <Icon name="plus" className="h-4 w-4" />
            Add product
          </Button>
        }
      />
      <ProductTable />
    </div>
  );
}
