import { ShieldCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTH } from "@/lib/utils";
import { getAdminAuditLogs } from "@/lib/admin-queries";

export default async function AdminAuditLogsPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div>
      <AdminPageHeader title="Audit Logs" description="ประวัติการทำรายการของผู้ดูแลระบบ" />

      {logs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="ยังไม่มีประวัติการทำรายการ"
          description="เมื่อผู้ดูแลระบบแก้ไขสินค้า สต๊อก หรือคำสั่งซื้อ ประวัติจะแสดงที่นี่"
        />
      ) : (
        <Table>
          <THead>
            <Th>ผู้ทำรายการ</Th>
            <Th>Action</Th>
            <Th>Entity</Th>
            <Th>เวลา</Th>
          </THead>
          <TBody>
            {logs.map((log) => (
              <Tr key={log.id}>
                <Td className="font-medium">{log.actor}</Td>
                <Td>
                  <code className="text-xs text-primary-soft">{log.action}</code>
                </Td>
                <Td className="text-muted">{log.entity}</Td>
                <Td className="text-muted">{formatDateTH(log.createdAt)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
