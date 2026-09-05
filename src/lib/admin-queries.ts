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

// ---------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------

const PAID_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "DELIVERED"];
const BANGKOK = "Asia/Bangkok";
const DAY_MS = 86_400_000;

/** YYYY-MM-DD for the given instant, in store-local (Bangkok) time. */
function dayKey(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: BANGKOK });
}

function bangkokMidnight(d: Date) {
  return new Date(`${dayKey(d)}T00:00:00+07:00`);
}

function dayLabel(key: string) {
  return new Date(`${key}T00:00:00+07:00`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: BANGKOK,
  });
}

export interface DailyPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsData {
  days: number;
  summary: {
    revenue: number;
    orders: number;
    avgOrder: number;
    newCustomers: number;
    failedOrders: number;
    prevRevenue: number;
    prevOrders: number;
  };
  daily: DailyPoint[];
  topProducts: { title: string; gameName: string; units: number; revenue: number }[];
  byGame: { name: string; units: number; revenue: number }[];
  paymentMethods: { method: string; count: number }[];
  orderStatus: { status: OrderStatus; count: number }[];
}

/**
 * Everything the analytics page shows, computed from real orders in the
 * last `days` days (Bangkok-local day buckets). Revenue only counts
 * orders that actually got paid; the previous equal-length window is
 * included so the page can show a trend.
 */
export async function getAnalytics(days: number): Promise<AnalyticsData> {
  const start = new Date(bangkokMidnight(new Date()).getTime() - (days - 1) * DAY_MS);
  const prevStart = new Date(start.getTime() - days * DAY_MS);

  const [orders, prevPaid, newCustomers, paidItems] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: start } },
      select: { status: true, totalAmount: true, createdAt: true, paymentMethod: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: prevStart, lt: start }, status: { in: PAID_STATUSES } },
      select: { totalAmount: true },
    }),
    db.user.count({ where: { createdAt: { gte: start }, role: "CUSTOMER" } }),
    db.orderItem.findMany({
      where: { order: { createdAt: { gte: start }, status: { in: PAID_STATUSES } } },
      select: {
        unitPrice: true,
        product: { select: { title: true, subtitle: true, game: { select: { name: true } } } },
      },
    }),
  ]);

  const paid = orders.filter((o) => PAID_STATUSES.includes(o.status as OrderStatus));
  const revenue = paid.reduce((s, o) => s + o.totalAmount, 0);
  const prevRevenue = prevPaid.reduce((s, o) => s + o.totalAmount, 0);

  const daily = new Map<string, DailyPoint>();
  for (let i = 0; i < days; i++) {
    const key = dayKey(new Date(start.getTime() + i * DAY_MS));
    daily.set(key, { date: key, label: dayLabel(key), revenue: 0, orders: 0 });
  }
  for (const o of paid) {
    const point = daily.get(dayKey(o.createdAt));
    if (!point) continue;
    point.revenue += o.totalAmount;
    point.orders += 1;
  }

  const productAgg = new Map<string, { title: string; gameName: string; units: number; revenue: number }>();
  const gameAgg = new Map<string, { name: string; units: number; revenue: number }>();
  for (const item of paidItems) {
    const title = `${item.product.title}${item.product.subtitle ? ` ${item.product.subtitle}` : ""}`;
    const gameName = item.product.game.name;
    const p = productAgg.get(title) ?? { title, gameName, units: 0, revenue: 0 };
    p.units += 1;
    p.revenue += item.unitPrice;
    productAgg.set(title, p);
    const g = gameAgg.get(gameName) ?? { name: gameName, units: 0, revenue: 0 };
    g.units += 1;
    g.revenue += item.unitPrice;
    gameAgg.set(gameName, g);
  }

  const methodAgg = new Map<string, number>();
  for (const o of orders) {
    const m = o.paymentMethod ?? "unknown";
    methodAgg.set(m, (methodAgg.get(m) ?? 0) + 1);
  }

  const statusAgg = new Map<OrderStatus, number>();
  for (const o of orders) {
    const s = o.status as OrderStatus;
    statusAgg.set(s, (statusAgg.get(s) ?? 0) + 1);
  }

  return {
    days,
    summary: {
      revenue,
      orders: paid.length,
      avgOrder: paid.length ? Math.round(revenue / paid.length) : 0,
      newCustomers,
      failedOrders: orders.filter((o) => o.status === "FAILED" || o.status === "CANCELLED").length,
      prevRevenue,
      prevOrders: prevPaid.length,
    },
    daily: Array.from(daily.values()),
    topProducts: Array.from(productAgg.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    byGame: Array.from(gameAgg.values()).sort((a, b) => b.revenue - a.revenue),
    paymentMethods: Array.from(methodAgg, ([method, count]) => ({ method, count })).sort((a, b) => b.count - a.count),
    orderStatus: Array.from(statusAgg, ([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count),
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
