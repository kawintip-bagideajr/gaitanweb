import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { updateGameSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const game = await db.game.findUnique({ where: { id } });
    if (!game) return NextResponse.json({ error: "ไม่พบเกม" }, { status: 404 });
    return NextResponse.json(game);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = updateGameSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

    const existing = await db.game.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "ไม่พบเกม" }, { status: 404 });

    const game = await db.game.update({ where: { id }, data: parsed.data });
    await writeAuditLog(admin.id, "game.update", "Game", id, parsed.data);

    return NextResponse.json(game);
  } catch (err) {
    return handleApiError(err);
  }
}
