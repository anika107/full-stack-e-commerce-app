import Link from "next/link";
import { ProductImage } from "./product-image";
import { formatMoney } from "@/lib/format";

type CardProduct = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
  stock: number;
  createdAt?: Date;
};

const NEW_WINDOW_DAYS = 30;

export function ProductCard({
  product,
  showNew = false,
}: {
  product: CardProduct;
  showNew?: boolean;
}) {
  const isNew =
    showNew &&
    product.createdAt &&
    product.createdAt.getTime() > Date.now() - NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(28,25,23,0.18)] dark:bg-stone-900 dark:ring-stone-800/60"
    >
      <div className="relative">
        <ProductImage
          category={product.category}
          name={product.name}
          imageUrl={product.imageUrl}
          className="aspect-4/5 w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {isNew ? (
          <span className="absolute left-3 top-3 rounded-full bg-stone-950/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            New
          </span>
        ) : null}
        {product.stock === 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
            Sold out
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
          {product.category}
        </p>
        <h3 className="font-display text-base font-medium leading-snug text-stone-900 transition-colors group-hover:text-blue-700 dark:text-stone-50 dark:group-hover:text-blue-400">
          {product.name}
        </h3>
        <p className="mt-auto pt-1.5 text-[15px] font-semibold tabular-nums text-stone-900 dark:text-stone-50">
          {formatMoney(product.price)}
        </p>
      </div>
    </Link>
  );
}
