import type { ContactPayload, RFQPayload } from "./validation";

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
