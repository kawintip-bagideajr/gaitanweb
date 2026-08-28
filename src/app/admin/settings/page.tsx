import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { db } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await db.storeSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return (
    <div>
      <AdminPageHeader title="Settings" description="ตั้งค่าข้อมูลร้านค้า" />
      <SettingsForm
        initial={{
          storeName: settings.storeName,
          supportEmail: settings.supportEmail ?? "",
          discordUrl: settings.discordUrl ?? "",
        }}
      />
    </div>
  );
}
