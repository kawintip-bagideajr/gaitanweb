import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { decrypt } from "@/lib/security/crypto";

// Stock added through the canonical admin system is stored as
// `ivHex:authTagHex:ciphertextHex` (AES-256-GCM). Older/manually-seeded
// rows may still be plain text — treat anything not matching that shape as
// already-plaintext rather than failing to decrypt it.
const ENCRYPTED_SHAPE = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i;

function resolveCode(secretData: string | null | undefined): string | null {
  if (!secretData) return null;
  if (!ENCRYPTED_SHAPE.test(secretData)) return secretData;
  return decrypt(secretData) ?? secretData;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const user = await requireUser();
    const { orderNumber } = await params;

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: { stockItem: true, product: true },
        },
      },
    });

    if (!order || (order.userId !== user.id && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    // The single most important guard in this codebase: never
    // return a code before the order has actually reached
    // DELIVERED, no matter what the client claims about payment.
    if (order.status !== "DELIVERED") {
      return NextResponse.json({ error: "สินค้ายังไม่พร้อมส่งมอบ" }, { status: 409 });
    }

    return NextResponse.json({
      items: order.orderItems.map((i) => ({
        title: `${i.product.title}${i.product.subtitle ? ` ${i.product.subtitle}` : ""}`,
        code: resolveCode(i.stockItem?.secretData),
      })),
    });
  } catch (err) {
    const status = typeof err === "object" && err !== null && "status" in err ? Number(err.status) : 500;
    if (status === 401) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    console.error(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดของระบบ" }, { status: 500 });
  }
}
