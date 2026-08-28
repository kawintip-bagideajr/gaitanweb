import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

// Same generic error for "no such user" and "wrong password" —
// don't leak which one it was.
const INVALID = { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } as const;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(INVALID, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return NextResponse.json(INVALID, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(INVALID, { status: 401 });
  }

  await createSession(user.id, user.role);

  return NextResponse.json({ id: user.id, email: user.email, displayName: user.displayName, role: user.role });
}
