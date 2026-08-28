import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminActionButton, patchJson } from "@/components/admin/AdminActionButton";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTHB } from "@/lib/utils";
import { getAdminProducts } from "@/lib/admin-queries";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { rows: products, totalPages, page: currentPage, total } = await getAdminProducts({
    q,
    page: page ? Number(page) : 1,
  });

  return (
    <div>
      <AdminPageHeader
        title="Product Management"
        description={`ทั้งหมด ${total} สินค้า`}
        searchPlaceholder="ค้นหาสินค้า..."
        searchDefault={q}
        action={
          <Link href="/admin/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Create Product
            </Button>
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState title="ไม่พบสินค้า" description={q ? `ไม่พบสินค้าที่ตรงกับ "${q}"` : "ยังไม่มีสินค้าในระบบ"} />
      ) : (
        <>
          <Table>
            <THead>
              <Th>สินค้า</Th>
              <Th>เกม</Th>
              <Th>ราคา</Th>
              <Th>สต๊อก</Th>
              <Th>สถานะ</Th>
              <Th className="text-right">จัดการ</Th>
            </THead>
            <TBody>
              {products.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{p.subtitle}</p>
                  </Td>
                  <Td className="text-muted">{p.gameName}</Td>
                  <Td>{formatTHB(p.price)}</Td>
                  <Td>
                    <Badge tone={p.stockCount <= 10 ? "warning" : "neutral"}>{p.stockCount}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs font-medium text-primary-soft hover:underline">
                        แก้ไข
                      </Link>
                      <AdminActionButton
                        label={p.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        tone={p.isActive ? "danger" : "primary"}
                        onClick={() => patchJson(`/api/admin/products/${p.id}`, { isActive: !p.isActive })}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <Pagination page={currentPage} totalPages={totalPages} basePath="/admin/products" query={{ q }} />
        </>
      )}
    </div>
  );
}
