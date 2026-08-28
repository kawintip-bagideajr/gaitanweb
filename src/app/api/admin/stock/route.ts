import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { addStockSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-errors";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = addStockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 400 });

    // Demo storage: codes go in as-is. A real deployment must encrypt
    // each one at the application layer before this write.
    const result = await db.stockItem.createMany({
      data: parsed.data.codes.map((code) => ({
        productId: product.id,
        secretData: code,
        status: "AVAILABLE",
      })),
    });

    await writeAuditLog(admin.id, "stock.add", "Product", product.id, { count: result.count });

    return NextResponse.json({ added: result.count });
  } catch (err) {
    return handleApiError(err);
  }
}
