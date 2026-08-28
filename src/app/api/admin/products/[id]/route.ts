import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { updateProductSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });

    const { subtitle, ...rest } = parsed.data;
    const product = await db.product.update({
      where: { id },
      data: { ...rest, ...(subtitle !== undefined ? { subtitle: subtitle || null } : {}) },
    });

    await writeAuditLog(admin.id, "product.update", "Product", product.id, parsed.data);

    return NextResponse.json(product);
  } catch (err) {
    return handleApiError(err);
  }
}
