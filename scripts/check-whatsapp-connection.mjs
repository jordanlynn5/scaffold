// Read-only diagnostic for slice 6's real WhatsApp connection.
// node --env-file=.env.local scripts/check-whatsapp-connection.mjs ACCOUNT_EMAIL
// Prints only connection flags and timestamps, never phone numbers or bodies.
import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];
if (!email) throw new Error('Usage: scripts/check-whatsapp-connection.mjs ACCOUNT_EMAIL');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: owner, error } = await db.from('profiles')
  .select('whatsapp, whatsapp_consent, whatsapp_joined_at, whatsapp_last_inbound_at')
  .eq('email', email).single();
if (error) throw error;
if (!owner.whatsapp) {
  console.log(JSON.stringify({ hasPhone: false }));
} else {
  const endpoint = new URL(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`);
  endpoint.searchParams.set('From', `whatsapp:${owner.whatsapp}`);
  endpoint.searchParams.set('To', process.env.TWILIO_WHATSAPP_FROM);
  endpoint.searchParams.set('PageSize', '5');
  const response = await fetch(endpoint, {
    headers: { Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}` },
  });
  if (!response.ok) throw new Error(`Twilio inbound status check failed (${response.status})`);
  const { messages } = await response.json();
  const latest = messages?.filter(m => m.direction === 'inbound')
    .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))[0];
  console.log(JSON.stringify({
    hasPhone: true,
    consent: owner.whatsapp_consent,
    appJoinedAt: owner.whatsapp_joined_at,
    appLastInboundAt: owner.whatsapp_last_inbound_at,
    latestTwilioInbound: latest?.date_created ?? null,
    twilioWindowOpen: latest ? Date.now() - new Date(latest.date_created).getTime() < 86400000 : false,
  }));
}
