import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminActionButton, patchJson } from "@/components/admin/AdminActionButton";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdminUsers } from "@/lib/admin-queries";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const [me, { rows: users, totalPages, page: currentPage, total }] = await Promise.all([
    getCurrentUser(),
    getAdminUsers({ q, page: page ? Number(page) : 1 }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Users Management"
        description={`ทั้งหมด ${total} ผู้ใช้`}
        searchPlaceholder="ค้นหาอีเมล..."
        searchDefault={q}
      />

      {users.length === 0 ? (
        <EmptyState title="ไม่พบผู้ใช้" description={q ? `ไม่พบอีเมลที่ตรงกับ "${q}"` : "ยังไม่มีผู้ใช้ในระบบ"} />
      ) : (
        <>
          <Table>
            <THead>
              <Th>ชื่อ</Th>
              <Th>อีเมล</Th>
              <Th>Role</Th>
              <Th>สถานะ</Th>
              <Th>สมัครเมื่อ</Th>
              <Th className="text-right">จัดการ</Th>
            </THead>
            <TBody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td className="font-medium">{u.displayName}</Td>
                  <Td className="text-muted">{u.email}</Td>
                  <Td>
                    <Badge tone={u.role === "ADMIN" ? "primary" : "neutral"}>{u.role}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "ใช้งานอยู่" : "ระงับ"}</Badge>
                  </Td>
                  <Td className="text-muted">{u.createdAt}</Td>
                  <Td className="text-right">
                    {u.id !== me?.id && (
                      <AdminActionButton
                        label={u.isActive ? "ระงับ" : "ยกเลิกระงับ"}
                        tone={u.isActive ? "danger" : "primary"}
                        onClick={() => patchJson(`/api/admin/users/${u.id}`, { isActive: !u.isActive })}
                      />
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <Pagination page={currentPage} totalPages={totalPages} basePath="/admin/users" query={{ q }} />
        </>
      )}
    </div>
  );
}
