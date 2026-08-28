import { AlertTriangle, CheckCircle2, Clock, DollarSign, Package, ShoppingCart, Truck, Warehouse } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { formatTHB } from "@/lib/utils";
import { getDashboardStats } from "@/lib/admin-queries";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

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
        <h2 className="mb-4 text-sm font-semibold text-foreground">Sales — 7 วันล่าสุด</h2>
        <div className="flex h-48 items-end gap-2">
          {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-primary/30 to-primary"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-muted-2">D{i + 1}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-2">* กราฟตัวอย่าง — ต้องต่อ time-series query จริงเพื่อแสดงยอดขายรายวัน</p>
      </Card>
    </div>
  );
}
