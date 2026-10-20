import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/services";
import { CategoriesGrid } from "@/components/admin/categories-grid";
import { AddCategoryButton } from "@/components/admin/category-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { CategoriesSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <Categories />
    </Suspense>
  );
}

async function Categories() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your catalog into browsable collections."
        actions={<AddCategoryButton />}
      />
      <CategoriesGrid categories={categories} />
    </div>
  );
}
