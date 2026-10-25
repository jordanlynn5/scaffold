import "server-only";

// Email through Resend (spec.md > External Services > Resend).

// Sends one email. Returns Resend's message id.
export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) throw new Error("Resend keys are missing.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) {
    throw new Error(`Resend refused the email: ${data.message ?? response.status}`);
  }
  return data.id as string;
}
