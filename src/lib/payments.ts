import "server-only";
import { db } from "@/lib/db";

export interface PaymentEvent {
  orderNumber: string;
  transactionId: string;
  provider: string;
  amount: number;
  status: "SUCCESS" | "FAILED";
}

export interface PaymentEventResult {
  ok: boolean;
  orderStatus?: string;
  idempotent?: boolean;
  error?: string;
}

/**
 * Single entry point for turning a payment confirmation into order
 * state changes. Called by the real gateway webhook and by the dev
 * payment simulator — both must go through the exact same
 * idempotency / stock-assignment guarantees, so the logic lives here
 * once instead of being duplicated per caller.
 */
export async function processPaymentEvent(event: PaymentEvent): Promise<PaymentEventResult> {
  const { orderNumber, transactionId, provider, amount, status } = event;

  // Idempotency: a gateway may redeliver the same webhook. transactionId
  // is unique at the DB level, so a repeat just returns the recorded
  // outcome instead of re-running stock assignment a second time.
  const existingPayment = await db.payment.findUnique({ where: { transactionId } });
  if (existingPayment) {
    const order = await db.order.findUnique({ where: { orderNumber } });
    return { ok: true, orderStatus: order?.status, idempotent: true };
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { orderItems: true },
  });
  if (!order) return { ok: false, error: "order not found" };

  if (status === "FAILED") {
    await db.$transaction(async (tx) => {
      await tx.payment.create({
        data: { orderId: order.id, provider, transactionId, amount, status: "FAILED" },
      });
      if (order.status === "PENDING_PAYMENT") {
        await tx.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
      }
    });
    return { ok: true, orderStatus: "FAILED" };
  }

  // status === "SUCCESS" past this point.
  if (order.status !== "PENDING_PAYMENT") {
    // Order already progressed past pending (e.g. a duplicate
    // "success" delivery) — log the payment, but never re-run stock
    // assignment against an order that's already been fulfilled.
    await db.payment.create({
      data: { orderId: order.id, provider, transactionId, amount, status: "SUCCESS", paidAt: new Date() },
    });
    return { ok: true, orderStatus: order.status, idempotent: true };
  }

  if (amount !== order.totalAmount) {
    await db.payment.create({
      data: { orderId: order.id, provider, transactionId, amount, status: "FAILED" },
    });
    return { ok: false, error: "amount mismatch" };
  }

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: { orderId: order.id, provider, transactionId, amount, status: "SUCCESS", paidAt: new Date() },
    });
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

    for (const orderItem of order.orderItems) {
      let claimed = false;

      // Optimistic compare-and-swap: re-assert status: "AVAILABLE" in
      // the WHERE clause of the write itself. If two requests race for
      // the same row, only the first UPDATE's WHERE still matches —
      // the second gets count 0 and retries against a different row.
      // This is safe under any isolation level, not just SQLite's
      // single-writer lock.
      for (let attempt = 0; attempt < 5 && !claimed; attempt++) {
        const candidate = await tx.stockItem.findFirst({
          where: { productId: orderItem.productId, status: "AVAILABLE", orderItemId: null },
        });
        if (!candidate) break; // out of stock — leave unfulfilled for admin follow-up

        const result = await tx.stockItem.updateMany({
          where: { id: candidate.id, status: "AVAILABLE", orderItemId: null },
          data: { status: "SOLD", orderItemId: orderItem.id },
        });
        claimed = result.count === 1;
      }

      if (claimed) {
        await tx.delivery.create({
          data: { orderItemId: orderItem.id, status: "DELIVERED", deliveredAt: new Date() },
        });
      }
    }

    const items = await tx.orderItem.findMany({
      where: { orderId: order.id },
      include: { delivery: true },
    });
    const allDelivered = items.every((i) => i.delivery?.status === "DELIVERED");

    await tx.order.update({
      where: { id: order.id },
      data: { status: allDelivered ? "DELIVERED" : "PROCESSING" },
    });
  });

  const finalOrder = await db.order.findUnique({ where: { id: order.id } });
  return { ok: true, orderStatus: finalOrder?.status };
}
