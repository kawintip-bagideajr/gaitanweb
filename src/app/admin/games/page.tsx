import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminActionButton, patchJson } from "@/components/admin/AdminActionButton";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getAdminGames } from "@/lib/admin-queries";

export default async function AdminGamesPage() {
  const games = await getAdminGames();

  return (
    <div>
      <AdminPageHeader
        title="Games"
        description={`ทั้งหมด ${games.length} เกม`}
        action={
          <Link href="/admin/games/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add Game
            </Button>
          </Link>
        }
      />

      <Table>
        <THead>
          <Th>เกม</Th>
          <Th>Slug</Th>
          <Th>จำนวนสินค้า</Th>
          <Th>สถานะ</Th>
          <Th className="text-right">จัดการ</Th>
        </THead>
        <TBody>
          {games.map((g) => (
            <Tr key={g.id}>
              <Td className="font-medium">{g.name}</Td>
              <Td className="text-muted">{g.slug}</Td>
              <Td className="text-muted">{g.productCount}</Td>
              <Td>
                <Badge tone={g.isActive ? "success" : "neutral"}>{g.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}</Badge>
              </Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/games/${g.id}/edit`} className="text-xs font-medium text-primary-soft hover:underline">
                    แก้ไข
                  </Link>
                  <AdminActionButton
                    label={g.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    tone={g.isActive ? "danger" : "primary"}
                    onClick={() => patchJson(`/api/admin/games/${g.id}`, { isActive: !g.isActive })}
                  />
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
