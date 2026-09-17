import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth";
import { requestPasswordResetSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/email";

const GENERIC_MESSAGE = "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Two limiters: one per-IP (stop a script hammering the endpoint) and one
  // per-email (stop someone spamming a single victim's inbox with reset
  // links from many IPs). Both use the same generic response either way.
  const ipLimit = rateLimit(`forgot-password:ip:${ip}`, 10, 10 * 60 * 1000);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: "คำขอถี่เกินไป กรุณาลองใหม่ภายหลัง" },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = requestPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "อีเมลไม่ถูกต้อง" }, { status: 400 });
  }

  const emailLimit = rateLimit(`forgot-password:email:${parsed.data.email}`, 3, 10 * 60 * 1000);
  if (!emailLimit.ok) {
    // Still the generic message — don't reveal that this specific email hit its own limit.
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  // Same response whether the email exists or not — don't let this
  // endpoint be used to enumerate registered accounts.
  const response: { message: string; devResetLink?: string } = { message: GENERIC_MESSAGE };

  if (user) {
    const token = await createPasswordResetToken(user.id, user.passwordHash);
    const resetUrl = `${req.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`;

    if (isEmailConfigured()) {
      const result = await sendPasswordResetEmail({ to: user.email, resetUrl });
      if (!result.ok) {
        // Log loudly server-side, but never leak send failures to the
        // client — that would itself confirm the email is registered.
        console.error(`[forgot-password] failed to email ${user.id}:`, result.error);
      }
    } else {
      // No email provider configured. In production this token MUST NOT
      // be handed back in the API response — that would let anyone reset
      // any account's password just by knowing their email. Only expose
      // it outside production so local dev still has a way to test the
      // flow without a real mailer.
      if (process.env.NODE_ENV !== "production") {
        response.devResetLink = `/reset-password?token=${encodeURIComponent(token)}`;
      } else {
        console.error(
          `[forgot-password] RESEND_API_KEY not set — reset email for ${user.id} was NOT sent`
        );
      }
    }
  }

  return NextResponse.json(response);
}
