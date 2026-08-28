import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { handleApiError } from "@/lib/api-errors";

const patchSchema = z.object({ isActive: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

    if (id === admin.id) {
      return NextResponse.json({ error: "ไม่สามารถระงับบัญชีของตัวเองได้" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    const user = await db.user.update({ where: { id }, data: { isActive: parsed.data.isActive } });
    await writeAuditLog(admin.id, parsed.data.isActive ? "user.activate" : "user.suspend", "User", id, {
      email: target.email,
    });

    return NextResponse.json({ id: user.id, isActive: user.isActive });
  } catch (err) {
    return handleApiError(err);
  }
}
