import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StockForm } from "@/components/admin/StockForm";
import { db } from "@/lib/db";

export default async function NewStockPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true, subtitle: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <AdminPageHeader title="Add Stock" description="เพิ่มโค้ด/คีย์ดิจิทัลเข้าคลังสินค้า" />
      <StockForm products={products} />
    </div>
  );
}
