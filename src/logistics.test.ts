import assert from "node:assert/strict";
import { shipmentEvent } from "./logistics.js";

const parsed = shipmentEvent.parse({ shipmentId: "S-42", recipient: "driver@example.com", kind: "hard_bounce", note: "mailbox rejected" });
assert.equal(parsed.kind, "hard_bounce");
assert.throws(() => shipmentEvent.parse({ shipmentId: "S-42", recipient: "bad", kind: "delivered" }));
console.log("shipment boundary test passed");
