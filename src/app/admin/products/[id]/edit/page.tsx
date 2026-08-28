import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminGames } from "@/lib/admin-queries";
import { db } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [games, product] = await Promise.all([getAdminGames(), db.product.findUnique({ where: { id } })]);
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title="Edit Product" description={product.title} />
      <ProductForm
        games={games}
        initial={{
          id: product.id,
          gameId: product.gameId,
          title: product.title,
          subtitle: product.subtitle ?? "",
          price: product.price,
          autoDelivery: product.autoDelivery,
        }}
      />
    </div>
  );
}
