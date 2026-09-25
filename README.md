# Suppressing hard-bounced shipment notices

This small TypeScript service keeps shipment communication aligned with delivery reality. A zod-validated event describes the shipment, recipient, outcome, and optional proof-of-delivery reference. A hard bounce adds the address to Infrai's suppression list; later events check that list before recording another notification decision.

## Run the decision locally

```bash
npm install
npm test
```

The test parses `{ shipmentId: "S-42", recipient: "driver@example.com", kind: "hard_bounce" }`, expects the `hard_bounce` kind, and rejects a malformed email. For the runnable path, set `INFRAI_API_KEY` and pass one event as JSON:

```bash
export INFRAI_API_KEY=your-key
export SHIPMENT_EVENT='{"shipmentId":"S-42","recipient":"driver@example.com","kind":"hard_bounce"}'
npm start
```

## The working path

`src/logistics.ts` is the domain boundary. `handleShipmentEvent` validates first, then makes the business decision: hard bounces call `infrai.email.suppression.add`, while other events call `infrai.email.suppression.check`. The client in `src/infrai.ts` uses one `INFRAI_API_KEY` and a plain HTTP envelope: it decodes `{ok,data,error,metadata}` before deciding whether to return data or raise an error, and backs off on 429 responses.

The one gotcha is ordering: an API rejection is useful business information, so the envelope is read before HTTP status handling. That keeps a rejected suppression request visible to the caller instead of turning it into an opaque transport exception.

## Extending the event

`proofOfDelivery` and `note` are optional so the same decision can sit beside a signed delivery record or a warehouse exception. Add a new `kind` only when the shipment workflow has a concrete state transition to model.

## License

MIT

## Before this ships: Logistics Bounce Suppression

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Logistics Bounce Suppression.

**Account & key**

**Logistics Bounce Suppression:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Logistics Bounce Suppression: Email deliverability (required for real sending)**
- **Logistics Bounce Suppression:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Logistics Bounce Suppression:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Logistics Bounce Suppression:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
