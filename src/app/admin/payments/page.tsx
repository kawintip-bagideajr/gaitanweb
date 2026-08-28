import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTH, formatTHB } from "@/lib/utils";
import { getAdminPayments } from "@/lib/admin-queries";

const TONE: Record<string, "success" | "warning" | "danger" | "info"> = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "danger",
  REFUNDED: "info",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const { rows: payments, totalPages, page: currentPage, total } = await getAdminPayments({
    q,
    page: page ? Number(page) : 1,
  });

  return (
    <div>
      <AdminPageHeader
        title="Payments Management"
        description={`ทั้งหมด ${total} รายการ`}
        searchPlaceholder="ค้นหา Transaction ID..."
        searchDefault={q}
      />

      {payments.length === 0 ? (
        <EmptyState title="ไม่พบรายการชำระเงิน" description={q ? `ไม่พบ Transaction ID ที่ตรงกับ "${q}"` : "เมื่อมีการชำระเงินสำเร็จ รายการจะแสดงที่นี่"} />
      ) : (
        <>
          <Table>
            <THead>
              <Th>Transaction ID</Th>
              <Th>Order</Th>
              <Th>Provider</Th>
              <Th>Amount</Th>
              <Th>สถานะ</Th>
              <Th>Paid At</Th>
            </THead>
            <TBody>
              {payments.map((p) => (
                <Tr key={p.id}>
                  <Td className="font-medium">{p.transactionId}</Td>
                  <Td className="text-muted">{p.orderNumber}</Td>
                  <Td className="text-muted">{p.provider}</Td>
                  <Td>{formatTHB(p.amount)}</Td>
                  <Td>
                    <Badge tone={TONE[p.status]}>{p.status}</Badge>
                  </Td>
                  <Td className="text-muted">{p.paidAt ? formatDateTH(p.paidAt) : "—"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <Pagination page={currentPage} totalPages={totalPages} basePath="/admin/payments" query={{ q }} />
        </>
      )}
    </div>
  );
}
