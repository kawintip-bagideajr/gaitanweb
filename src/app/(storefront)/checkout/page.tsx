import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CheckoutForm } from "@/components/marketplace/CheckoutForm";
import { getCurrentUser } from "@/lib/auth";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "หน้าแรก", href: "/" },
          { label: "ตะกร้าสินค้า", href: "/cart" },
          { label: "ชำระเงิน" },
        ]}
      />
      <h1 className="mt-4 mb-8 text-2xl font-bold text-foreground">ชำระเงิน</h1>
      <CheckoutForm />
    </div>
  );
}
