import type { ContactPayload, RFQPayload } from "./validation";
import { adminNotificationEmails, escapeHtml, sendEmail } from "./email/provider";
import { createAdminSupabaseClient } from "./supabase/admin";

type Submission =
  | { type: "contact"; payload: ContactPayload }
  | {
      type: "rfq";
      payload: RFQPayload;
      bom?: { name: string; type: string; size: number };
    };

export async function forwardSubmission(submission: Submission) {
  const webhook = process.env.CRM_WEBHOOK_URL;

  if (!webhook) {
    return { delivered: false, reason: "CRM_WEBHOOK_URL not configured" };
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...submission,
      receivedAt: new Date().toISOString(),
      source: "quicksol-global-web",
    }),
  });

  if (!response.ok) {
    throw new Error("CRM webhook rejected the submission");
  }

  return { delivered: true };
}

export async function saveContactSubmission(
  payload: ContactPayload,
  locale = "en",
) {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return { saved: false, reason: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("contact_requests")
    .insert({
      name: payload.name,
      company_name: payload.company,
      email: payload.email,
      phone: payload.phone || null,
      country: payload.country,
      message: payload.message,
      locale,
      status: "new",
      notification_status: "pending",
    })
    .select("id,created_at")
    .single();

  if (error) {
    throw new Error("Could not save contact request");
  }

  const recipients = adminNotificationEmails();
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${locale}/admin/contacts`;
  const adminEmail = await sendEmail({
    to: recipients,
    replyTo: payload.email,
    subject: "Nueva solicitud de contacto — Quicksol",
    html: `
      <h1>Nueva solicitud de contacto — Quicksol</h1>
      <p><strong>Nombre:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Empresa:</strong> ${escapeHtml(payload.company)}</p>
      <p><strong>Correo:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(payload.phone)}</p>
      <p><strong>Pais:</strong> ${escapeHtml(payload.country)}</p>
      <p><strong>Idioma:</strong> ${escapeHtml(locale)}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(payload.message)}</p>
      <p><a href="${escapeHtml(adminUrl)}">Ver en admin</a></p>
    `,
  });

  const customerEmail = await sendEmail({
    to: [payload.email],
    subject: "Quicksol recibió tu solicitud",
    html: `
      <h1>Quicksol recibió tu solicitud</h1>
      <p>Gracias, ${escapeHtml(payload.name)}. Recibimos tu solicitud #${escapeHtml(data.id)}.</p>
      <p>Un representante de Quicksol revisará la información y responderá. Este mensaje no confirma precio ni fecha de entrega.</p>
    `,
  });

  const status = !recipients.length || adminEmail.disabled
    ? "disabled"
    : adminEmail.ok
      ? "sent"
      : "failed";

  await supabase
    .from("contact_requests")
    .update({
      notification_status: status,
      notification_error: adminEmail.ok
        ? null
        : adminEmail.disabled
          ? "Email is not configured"
          : adminEmail.error || "Email failed",
      notified_at: adminEmail.ok || customerEmail.ok ? new Date().toISOString() : null,
    })
    .eq("id", data.id);

  return { saved: true, id: data.id };
}

export async function saveRFQSubmission(
  payload: RFQPayload,
  locale = "en",
  bom?: { name: string; type: string; size: number },
) {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return { saved: false, reason: "Supabase is not configured" };
  }

  const { data, error } = await supabase
    .from("rfq_requests")
    .insert({
      company_name: payload.company,
      contact_name: payload.contactName,
      email: payload.email,
      phone: payload.phone || null,
      country: payload.country,
      message: payload.notes || null,
      status: "new",
      notification_status: "pending",
      currency: "USD",
    })
    .select("id,created_at")
    .single();

  if (error) {
    throw new Error("Could not save RFQ request");
  }

  await supabase.from("rfq_items").insert({
    rfq_id: data.id,
    requested_mpn: payload.partNumber,
    quantity: payload.quantity,
    target_price: payload.targetPrice ? Number(payload.targetPrice) || null : null,
    required_date: payload.requiredDate || null,
    notes: [payload.manufacturer, payload.notes, bom?.name ? `BOM: ${bom.name}` : ""]
      .filter(Boolean)
      .join("\n"),
  });

  const recipients = adminNotificationEmails();
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${locale}/admin/rfqs`;
  const adminEmail = await sendEmail({
    to: recipients,
    replyTo: payload.email,
    subject: `Nueva solicitud de cotización — Quicksol — ${payload.partNumber || payload.company}`,
    html: `
      <h1>Nueva solicitud de cotización — Quicksol</h1>
      <p><strong>Empresa:</strong> ${escapeHtml(payload.company)}</p>
      <p><strong>Nombre:</strong> ${escapeHtml(payload.contactName)}</p>
      <p><strong>Correo:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(payload.phone)}</p>
      <p><strong>Pais:</strong> ${escapeHtml(payload.country)}</p>
      <p><strong>Numero de parte:</strong> ${escapeHtml(payload.partNumber)}</p>
      <p><strong>Fabricante:</strong> ${escapeHtml(payload.manufacturer)}</p>
      <p><strong>Cantidad:</strong> ${escapeHtml(payload.quantity)}</p>
      <p><strong>Precio objetivo:</strong> ${escapeHtml(payload.targetPrice)}</p>
      <p><strong>Fecha requerida:</strong> ${escapeHtml(payload.requiredDate)}</p>
      <p><strong>Notas:</strong> ${escapeHtml(payload.notes)}</p>
      <p><strong>BOM:</strong> ${escapeHtml(bom?.name || "No adjunto")}</p>
      <p><a href="${escapeHtml(adminUrl)}">Ver en admin</a></p>
    `,
  });

  const customerEmail = await sendEmail({
    to: [payload.email],
    subject: "Quicksol recibió tu solicitud de cotización",
    html: `
      <h1>Quicksol recibió tu solicitud</h1>
      <p>Gracias, ${escapeHtml(payload.contactName)}. Recibimos tu solicitud #${escapeHtml(data.id)}.</p>
      <p>Un representante de Quicksol revisará la información y responderá. Este mensaje no confirma precio ni fecha de entrega.</p>
    `,
  });

  const status = !recipients.length || adminEmail.disabled
    ? "disabled"
    : adminEmail.ok
      ? "sent"
      : "failed";

  await supabase
    .from("rfq_requests")
    .update({
      notification_status: status,
      notification_error: adminEmail.ok
        ? null
        : adminEmail.disabled
          ? "Email is not configured"
          : adminEmail.error || "Email failed",
      notified_at: adminEmail.ok || customerEmail.ok ? new Date().toISOString() : null,
    })
    .eq("id", data.id);

  return { saved: true, id: data.id };
}
