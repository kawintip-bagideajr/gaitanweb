import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { handleApiError } from "@/lib/api-errors";
import { decrypt } from "@/lib/security/crypto";

const ENCRYPTED_SHAPE = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i;

function resolveCode(secretData: string | null | undefined): string | null {
  if (!secretData) return null;
  if (!ENCRYPTED_SHAPE.test(secretData)) return secretData;
  return decrypt(secretData) ?? secretData;
}

/**
 * Full delivered codes for support cases (customer lost them, needs a
 * manual resend). Every reveal is audit-logged with the admin's id.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const admin = await requireAdmin();
    const { orderNumber } = await params;

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          orderBy: { createdAt: "asc" },
          include: { product: { select: { title: true, subtitle: true } }, stockItem: { select: { secretData: true } } },
        },
      },
    });
    if (!order) return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });

    await writeAuditLog(admin.id, "order.codes.view", "Order", order.id, { orderNumber });

    return NextResponse.json({
      items: order.orderItems.map((i) => ({
        title: `${i.product.title}${i.product.subtitle ? ` ${i.product.subtitle}` : ""}`,
        code: resolveCode(i.stockItem?.secretData),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
