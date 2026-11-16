import mediaWorker from '../../../../src/case-media-worker.mjs';

export function onRequest({ request, env }) {
  return mediaWorker.fetch(request, env);
}
