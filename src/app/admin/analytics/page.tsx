import { BarChart3, LineChart, PieChart } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";

const PLACEHOLDER_CHARTS = [
  { icon: LineChart, title: "ยอดขายรายวัน" },
  { icon: BarChart3, title: "สินค้าขายดี" },
  { icon: PieChart, title: "สัดส่วนช่องทางชำระเงิน" },
];

export default function AdminAnalyticsPage() {
  return (
    <div>
      <AdminPageHeader title="Analytics" description="เชื่อมต่อฐานข้อมูลจริงเพื่อแสดงกราฟและรายงานที่นี่" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PLACEHOLDER_CHARTS.map(({ icon: Icon, title }) => (
          <Card key={title} className="flex h-56 flex-col items-center justify-center gap-3 p-6 text-center">
            <Icon className="h-8 w-8 text-muted-2" />
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-2">รอข้อมูลจากฐานข้อมูล</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
