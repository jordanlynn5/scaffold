import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { whatsappBlocked, type ChannelFacts } from "@/lib/nudges/channel";
import { sandboxJoin } from "@/lib/nudges/whatsapp";

// The quiet connection notice from spec.md > WhatsApp Connection Notice.
export function WhatsAppNotice({ person }: { person: ChannelFacts }) {
  const blocked = whatsappBlocked(person);
  if (!blocked || blocked === "switched-off") return null;
  const { number, message } = sandboxJoin();
  const needsSettings = blocked === "no-consent" || blocked === "no-number";
  return (
    <Card variant="quiet" className="flex flex-col items-start gap-2">
      <p className="text-body-sm text-text-secondary">
        {needsSettings
          ? "Your nudges arrive by email. Add your WhatsApp number and turn on WhatsApp messages in Profile to get them there."
          : <>Your nudges arrive by email while WhatsApp is disconnected. To reconnect, send <strong>{message}</strong> to <strong>{number}</strong> on WhatsApp, then send a short hello.</>}
      </p>
      {needsSettings ? <ButtonLink href="/profile" variant="link">Open Profile →</ButtonLink> : null}
    </Card>
  );
}
