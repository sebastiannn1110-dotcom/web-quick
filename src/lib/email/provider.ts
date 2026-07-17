import "server-only";

type EmailPayload = {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export function emailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.EMAIL_FROM &&
      process.env.ADMIN_NOTIFICATION_EMAILS,
  );
}

export function adminNotificationEmails() {
  return (process.env.ADMIN_NOTIFICATION_EMAILS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendEmail(payload: EmailPayload) {
  if (!emailConfigured()) {
    return { ok: false as const, disabled: true as const };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });

    if (!response.ok) {
      return {
        ok: false as const,
        disabled: false as const,
        error: `Resend returned ${response.status}`,
      };
    }

    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      disabled: false as const,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}
