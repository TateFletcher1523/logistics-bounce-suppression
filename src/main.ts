import { handleShipmentEvent } from "./logistics.js";

const raw = process.env.SHIPMENT_EVENT;
if (!raw) throw new Error('SHIPMENT_EVENT must be JSON, for example {"shipmentId":"S-42","recipient":"ops@example.com","kind":"hard_bounce"}');
const result = await handleShipmentEvent(JSON.parse(raw));
console.log(JSON.stringify(result));
