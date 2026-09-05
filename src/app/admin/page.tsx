import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, DollarSign, Package, ShoppingCart, Truck, Warehouse } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { ColumnChart } from "@/components/admin/charts";
import { Card } from "@/components/ui/Card";
import { formatTHB } from "@/lib/utils";
import { getAnalytics, getDashboardStats } from "@/lib/admin-queries";

export default async function AdminDashboardPage() {
  const [stats, week] = await Promise.all([getDashboardStats(), getAnalytics(7)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">ภาพรวมระบบและคำสั่งซื้อล่าสุด</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Sales" value={formatTHB(stats.totalSales)} tone="success" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={String(stats.totalOrders)} />
        <StatCard icon={CheckCircle2} label="Paid Orders" value={String(stats.paidOrders)} tone="success" />
        <StatCard icon={Clock} label="Pending Orders" value={String(stats.pendingOrders)} tone="warning" />
        <StatCard icon={Truck} label="Delivered Orders" value={String(stats.deliveredOrders)} tone="success" />
        <StatCard icon={Warehouse} label="Available Stock" value={String(stats.availableStock)} />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Alert"
          value={String(stats.lowStockCount)}
          tone={stats.lowStockCount > 0 ? "danger" : "neutral"}
        />
        <StatCard icon={Package} label="Active Products" value={String(stats.activeProducts)} />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">ยอดขาย — 7 วันล่าสุด</h2>
            <p className="text-xs text-muted-2">รวม {formatTHB(week.summary.revenue)} จาก {week.summary.orders} ออเดอร์ที่ชำระแล้ว</p>
          </div>
          <Link href="/admin/analytics" className="text-xs font-medium text-primary-soft hover:underline">
            ดู Analytics ทั้งหมด →
          </Link>
        </div>
        <ColumnChart points={week.daily.map((d) => ({ label: d.label, value: d.revenue }))} />
      </Card>
    </div>
  );
}
