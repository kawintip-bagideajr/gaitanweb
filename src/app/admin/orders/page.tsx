import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTH, formatTHB } from "@/lib/utils";
import { getAdminOrders } from "@/lib/admin-queries";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { rows: orders, totalPages, page: currentPage, total } = await getAdminOrders({
    q,
    page: page ? Number(page) : 1,
  });

  return (
    <div>
      <AdminPageHeader
        title="Orders Management"
        description={`ทั้งหมด ${total} คำสั่งซื้อ`}
        searchPlaceholder="ค้นหาเลขที่คำสั่งซื้อ..."
        searchDefault={q}
      />

      {orders.length === 0 ? (
        <EmptyState title="ไม่พบคำสั่งซื้อ" description={q ? `ไม่พบเลขที่ตรงกับ "${q}"` : "เมื่อลูกค้าสั่งซื้อสินค้า รายการจะแสดงที่นี่"} />
      ) : (
        <>
          <Table>
            <THead>
              <Th>Order ID</Th>
              <Th>สินค้า</Th>
              <Th>ยอดชำระ</Th>
              <Th>สถานะ</Th>
              <Th>วันที่สร้าง</Th>
              <Th className="text-right">จัดการ</Th>
            </THead>
            <TBody>
              {orders.map((order) => (
                <Tr key={order.orderNumber}>
                  <Td className="font-medium">{order.orderNumber}</Td>
                  <Td className="text-muted">{order.productTitle}</Td>
                  <Td>{formatTHB(order.price)}</Td>
                  <Td>
                    <StatusBadge status={order.status} />
                  </Td>
                  <Td className="text-muted">{formatDateTH(order.createdAt)}</Td>
                  <Td className="text-right">
                    <Link href={`/orders/${order.orderNumber}`} className="text-xs font-medium text-primary-soft hover:underline">
                      ดูรายละเอียด
                    </Link>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <Pagination page={currentPage} totalPages={totalPages} basePath="/admin/orders" query={{ q }} />
        </>
      )}
    </div>
  );
}
