import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth";
import { requestPasswordResetSchema } from "@/lib/validation";

const GENERIC_MESSAGE = "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "อีเมลไม่ถูกต้อง" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  // Same response whether the email exists or not — don't let this
  // endpoint be used to enumerate registered accounts.
  const response: { message: string; devResetLink?: string } = { message: GENERIC_MESSAGE };

  if (user) {
    const token = await createPasswordResetToken(user.id, user.passwordHash);
    // No email provider is wired up yet, so the reset link is handed
    // back directly instead of being sent — this field must be
    // removed the moment a real mailer is in place.
    response.devResetLink = `/reset-password?token=${encodeURIComponent(token)}`;
  }

  return NextResponse.json(response);
}
