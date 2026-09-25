import { z } from "zod";
import { infrai } from "./infrai.js";

export const shipmentEvent = z.object({ shipmentId: z.string().min(1), recipient: z.string().email(), kind: z.enum(["delivered", "hard_bounce", "exception"]), proofOfDelivery: z.string().optional(), note: z.string().optional() });
export type ShipmentEvent = z.infer<typeof shipmentEvent>;

export async function handleShipmentEvent(input: unknown) {
  const event = shipmentEvent.parse(input);
  if (event.kind === "hard_bounce") {
    await infrai.email.suppression.add(event.recipient);
    return { shipmentId: event.shipmentId, action: "suppressed", recipient: event.recipient } as const;
  }
  const status = await infrai.email.suppression.check(event.recipient);
  if (status.suppressed) return { shipmentId: event.shipmentId, action: "skipped", recipient: event.recipient } as const;
  return { shipmentId: event.shipmentId, action: "recorded", recipient: event.recipient, proofOfDelivery: event.proofOfDelivery } as const;
}
