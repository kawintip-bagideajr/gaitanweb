import "server-only";
import { db } from "@/lib/db";
import type { OrderStatus, PaymentStatus, StockStatus } from "@/types";

const PAGE_SIZE = 10;

export interface ListParams {
  q?: string;
  page?: number;
}

export interface Paginated<T> {
  rows: T[];
  page: number;
  totalPages: number;
  total: number;
}

function pageOf(page?: number) {
  return Math.max(1, page ?? 1);
}

export async function getDashboardStats() {
  const [
    deliveredOrders,
    totalOrders,
    paidOrders,
    pendingOrders,
    deliveredCount,
    availableStock,
    activeProducts,
    lowStockProducts,
  ] = await Promise.all([
    db.order.findMany({ where: { status: "DELIVERED" }, select: { totalAmount: true } }),
    db.order.count(),
    db.order.count({ where: { status: { in: ["PAID", "PROCESSING", "DELIVERED"] } } }),
    db.order.count({ where: { status: "PENDING_PAYMENT" } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.stockItem.count({ where: { status: "AVAILABLE" } }),
    db.product.count({ where: { isActive: true } }),
    db.product.findMany({
      where: { isActive: true },
      include: { _count: { select: { stockItems: { where: { status: "AVAILABLE" } } } } },
    }),
  ]);

  const totalSales = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockCount = lowStockProducts.filter((p) => p._count.stockItems <= 10).length;

  return {
    totalSales,
    totalOrders,
    paidOrders,
    pendingOrders,
    deliveredOrders: deliveredCount,
    availableStock,
    activeProducts,
    lowStockCount,
  };
}

export async function getAdminProducts({ q, page }: ListParams = {}): Promise<
  Paginated<{ id: string; title: string; subtitle: string | null; gameName: string; price: number; stockCount: number; isActive: boolean }>
> {
  const where = q ? { title: { contains: q } } : {};
  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        game: { select: { name: true } },
        _count: { select: { stockItems: { where: { status: "AVAILABLE" } } } },
      },
      skip: (pageOf(page) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: products.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      gameName: p.game.name,
      price: p.price,
      stockCount: p._count.stockItems,
      isActive: p.isActive,
    })),
    page: pageOf(page),
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export async function getAdminStock({ q, page }: ListParams = {}): Promise<
  Paginated<{ id: string; productTitle: string; maskedSecret: string; status: StockStatus; addedAt: string }>
> {
  const where = q ? { product: { title: { contains: q } } } : {};
  const [total, items] = await Promise.all([
    db.stockItem.count({ where }),
    db.stockItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true, subtitle: true } } },
      skip: (pageOf(page) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: items.map((s) => ({
      id: s.id,
      productTitle: `${s.product.title}${s.product.subtitle ? ` ${s.product.subtitle}` : ""}`,
      // Never send the real secret to an admin list view — mask it the
      // same way a public API would; full value is only ever read by
      // the owning customer's delivery page after DELIVERED.
      maskedSecret: s.secretData.replace(/.(?=.{4})/g, "•"),
      status: s.status as StockStatus,
      addedAt: s.createdAt.toISOString().slice(0, 10),
    })),
    page: pageOf(page),
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export async function getAdminOrders({ q, page }: ListParams = {}): Promise<
  Paginated<{ orderNumber: string; productTitle: string; price: number; createdAt: string; status: OrderStatus }>
> {
  const where = q ? { orderNumber: { contains: q } } : {};
  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { orderItems: { include: { product: true }, take: 1 }, _count: { select: { orderItems: true } } },
      skip: (pageOf(page) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: orders.map((o) => ({
      orderNumber: o.orderNumber,
      productTitle:
        o._count.orderItems <= 1
          ? (o.orderItems[0]?.product.title ?? "-")
          : `${o.orderItems[0]?.product.title ?? "-"} และอีก ${o._count.orderItems - 1} รายการ`,
      price: o.totalAmount,
      createdAt: o.createdAt.toISOString(),
      status: o.status as OrderStatus,
    })),
    page: pageOf(page),
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export async function getAdminPayments({ q, page }: ListParams = {}): Promise<
  Paginated<{ id: string; transactionId: string; orderNumber: string; provider: string; amount: number; status: PaymentStatus; paidAt: string | null }>
> {
  const where = q ? { transactionId: { contains: q } } : {};
  const [total, payments] = await Promise.all([
    db.payment.count({ where }),
    db.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true } } },
      skip: (pageOf(page) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: payments.map((p) => ({
      id: p.id,
      transactionId: p.transactionId,
      orderNumber: p.order.orderNumber,
      provider: p.provider,
      amount: p.amount,
      status: p.status as PaymentStatus,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    })),
    page: pageOf(page),
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export async function getAdminUsers({ q, page }: ListParams = {}): Promise<
  Paginated<{ id: string; displayName: string; email: string; role: string; isActive: boolean; createdAt: string }>
> {
  const where = q ? { email: { contains: q } } : {};
  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageOf(page) - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    rows: users.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString().slice(0, 10),
    })),
    page: pageOf(page),
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };
}

export async function getAdminAuditLogs() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { displayName: true } } },
    take: 100,
  });
  return logs.map((l) => ({
    id: l.id,
    actor: l.actor.displayName,
    action: l.action,
    entity: l.entity,
    createdAt: l.createdAt.toISOString(),
  }));
}

export async function getAdminGames() {
  const games = await db.game.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return games.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    isActive: g.isActive,
    productCount: g._count.products,
  }));
}
