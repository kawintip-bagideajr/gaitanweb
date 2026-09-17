import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

/** True once a real email provider is configured (i.e. not local dev). */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface SendResult {
  ok: boolean;
  error?: string;
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}): Promise<SendResult> {
  const resend = getClient();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const from = process.env.EMAIL_FROM ?? "Xelvex <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "รีเซ็ตรหัสผ่าน Xelvex",
      text: `คุณได้ขอรีเซ็ตรหัสผ่านบัญชี Xelvex ของคุณ\n\nคลิกลิงก์นี้เพื่อตั้งรหัสผ่านใหม่ (หมดอายุใน 15 นาที):\n${params.resetUrl}\n\nถ้าคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยต่ออีเมลนี้ได้ทันที รหัสผ่านของคุณจะไม่มีการเปลี่ยนแปลง`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 8px;">รีเซ็ตรหัสผ่าน Xelvex</h2>
          <p>คุณได้ขอรีเซ็ตรหัสผ่านบัญชี Xelvex ของคุณ</p>
          <p>
            <a href="${params.resetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              ตั้งรหัสผ่านใหม่
            </a>
          </p>
          <p style="color: #6b7280; font-size: 13px;">ลิงก์นี้หมดอายุภายใน 15 นาที และใช้ได้ครั้งเดียว</p>
          <p style="color: #6b7280; font-size: 13px;">ถ้าคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยต่ออีเมลนี้ได้ทันที รหัสผ่านของคุณจะไม่มีการเปลี่ยนแปลง</p>
        </div>
      `,
    });

    if (error) {
      console.error("[email] sendPasswordResetEmail failed:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("[email] sendPasswordResetEmail threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
