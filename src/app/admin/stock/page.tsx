import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminActionButton, patchJson } from "@/components/admin/AdminActionButton";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminStock } from "@/lib/admin-queries";

const TONE: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  AVAILABLE: "success",
  RESERVED: "warning",
  SOLD: "neutral",
  DISABLED: "danger",
};

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { rows: stockItems, totalPages, page: currentPage, total } = await getAdminStock({
    q,
    page: page ? Number(page) : 1,
  });

  return (
    <div>
      <AdminPageHeader
        title="Stock Management"
        description={`ทั้งหมด ${total} รายการ — ข้อมูลจริงจะถูกเข้ารหัสและไม่แสดงเต็มในหน้านี้`}
        searchPlaceholder="ค้นหาชื่อสินค้า..."
        searchDefault={q}
        action={
          <Link href="/admin/stock/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Stock
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-[var(--warning-soft)] p-3 text-xs text-warning">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        ข้อมูลรหัสเต็มจะไม่ถูกส่งผ่าน public API และแสดงเฉพาะตอนจำเป็นเท่านั้น
      </div>

      {stockItems.length === 0 ? (
        <EmptyState title="ไม่พบรายการสต๊อก" description={q ? `ไม่พบสินค้าที่ตรงกับ "${q}"` : "ยังไม่มีสต๊อกในระบบ"} />
      ) : (
        <>
          <Table>
            <THead>
              <Th>สินค้า</Th>
              <Th>รหัส (ปิดบัง)</Th>
              <Th>สถานะ</Th>
              <Th>เพิ่มเมื่อ</Th>
              <Th className="text-right">จัดการ</Th>
            </THead>
            <TBody>
              {stockItems.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.productTitle}</Td>
                  <Td>
                    <code className="text-xs text-muted">{item.maskedSecret}</code>
                  </Td>
                  <Td>
                    <Badge tone={TONE[item.status]}>{item.status}</Badge>
                  </Td>
                  <Td className="text-muted">{item.addedAt}</Td>
                  <Td className="text-right">
                    {(item.status === "AVAILABLE" || item.status === "DISABLED") && (
                      <AdminActionButton
                        label={item.status === "AVAILABLE" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        tone={item.status === "AVAILABLE" ? "danger" : "primary"}
                        onClick={() =>
                          patchJson(`/api/admin/stock/${item.id}`, {
                            status: item.status === "AVAILABLE" ? "DISABLED" : "AVAILABLE",
                          })
                        }
                      />
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <Pagination page={currentPage} totalPages={totalPages} basePath="/admin/stock" query={{ q }} />
        </>
      )}
    </div>
  );
}
