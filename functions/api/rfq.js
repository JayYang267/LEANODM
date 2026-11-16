import { handleRfqRequest } from '../../src/server/rfq-receiver.mjs';

export function onRequest({ request, env }) {
  return handleRfqRequest(request, env);
}
