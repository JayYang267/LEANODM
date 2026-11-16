import caseMediaWorker from './case-media-worker.mjs';
import { handleRfqRequest } from './server/rfq-receiver.mjs';

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/api/rfq') return handleRfqRequest(request, env);
    return caseMediaWorker.fetch(request, env);
  },
};
