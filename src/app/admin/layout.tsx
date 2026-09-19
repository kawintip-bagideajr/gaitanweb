import { redirect } from "next/navigation";

// This built-in admin panel has been superseded by the dedicated
// Xelvex-AdminSystem app (separate deployment, isolated DB access, RBAC +
// Dual-Control + 2FA). Every route under /admin now redirects there instead
// of rendering — kept in the codebase rather than deleted so nothing is lost
// if a page here still has functionality not yet ported over.
export default async function AdminLayout(_props: { children: React.ReactNode }) {
  redirect("https://xelvex-admin-system.vercel.app");
}
