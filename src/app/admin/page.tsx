import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Package, ShoppingCart, Truck, Warehouse } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { ColumnChart } from "@/components/admin/charts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTH, formatTHB } from "@/lib/utils";
import { getAnalytics, getDashboardStats, getLowStockProducts, getRecentOrders } from "@/lib/admin-queries";

export default async function AdminDashboardPage() {
  const [stats, week, recentOrders, lowStock] = await Promise.all([
    getDashboardStats(),
    getAnalytics(7),
    getRecentOrders(6),
    getLowStockProducts(8),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">แดชบอร์ด</h1>
        <p className="text-sm text-muted">ภาพรวมร้านและสิ่งที่ต้องจัดการวันนี้</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="ยอดขายรวม" value={formatTHB(stats.totalSales)} tone="success" />
        <StatCard icon={ShoppingCart} label="ออเดอร์ทั้งหมด" value={String(stats.totalOrders)} />
        <StatCard icon={CheckCircle2} label="ชำระเงินแล้ว" value={String(stats.paidOrders)} tone="success" />
        <StatCard icon={Clock} label="รอชำระเงิน" value={String(stats.pendingOrders)} tone="warning" />
        <StatCard icon={Truck} label="จัดส่งแล้ว" value={String(stats.deliveredOrders)} tone="success" />
        <StatCard icon={Warehouse} label="สต๊อกพร้อมขาย" value={String(stats.availableStock)} />
        <StatCard
          icon={AlertTriangle}
          label="สินค้าใกล้หมด"
          value={String(stats.lowStockCount)}
          tone={stats.lowStockCount > 0 ? "danger" : "neutral"}
        />
        <StatCard icon={Package} label="สินค้าที่เปิดขาย" value={String(stats.activeProducts)} />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">ยอดขาย — 7 วันล่าสุด</h2>
            <p className="text-xs text-muted-2">
              รวม {formatTHB(week.summary.revenue)} จาก {week.summary.orders} ออเดอร์ที่ชำระแล้ว
            </p>
          </div>
          <Link href="/admin/analytics" className="text-xs font-medium text-primary-soft hover:underline">
            ดูสถิติทั้งหมด →
          </Link>
        </div>
        <ColumnChart points={week.daily.map((d) => ({ label: d.label, value: d.revenue }))} />
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-sm font-semibold text-foreground">ออเดอร์ล่าสุด</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-primary-soft hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-muted-2">ยังไม่มีออเดอร์</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-y border-border bg-surface-2/60 text-left text-xs uppercase tracking-wide text-muted-2">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">ออเดอร์</th>
                    <th className="px-5 py-2.5 font-semibold">ลูกค้า</th>
                    <th className="px-5 py-2.5 font-semibold">ยอด</th>
                    <th className="px-5 py-2.5 font-semibold">สถานะ</th>
                    <th className="px-5 py-2.5 font-semibold">เวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((o) => (
                    <tr key={o.orderNumber} className="transition-colors hover:bg-surface-2/50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${o.orderNumber}`} className="font-medium text-primary-soft hover:underline">
                          {o.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-2">{o.productTitle}</p>
                      </td>
                      <td className="px-5 py-3 text-muted">{o.customerEmail}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{formatTHB(o.price)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-muted">{formatDateTH(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">สินค้าใกล้หมด</h2>
            <Link href="/admin/stock" className="text-xs font-medium text-primary-soft hover:underline">
              จัดการสต๊อก →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-2">สต๊อกทุกรายการเพียงพอ</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-2">{p.gameName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={p.stockCount === 0 ? "danger" : "warning"}>{p.stockCount === 0 ? "หมด" : `เหลือ ${p.stockCount}`}</Badge>
                    <Link href={`/admin/stock/new?productId=${p.id}`} className="text-xs font-medium text-primary-soft hover:underline">
                      เติม
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
