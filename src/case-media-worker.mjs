const VIDEO_PATH = '/media/cases/interactive-driving-sound-book/driving-activity-book.mp4';
const VERIFIED_VIDEO_LENGTH = 23_935_283;
const VERIFIED_VIDEO_ETAGS = new Set([
  '"a07ad4e3d270dd4d250e633b0ed4ca4e"', // Production assets service.
  '"c5f043811cac0cf5521d7793eb4a5afb"', // Local Wrangler assets service.
]);

function parseRange(header) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(header ?? '');
  if (!match || (!match[1] && !match[2])) return null;
  const first = match[1] ? Number(match[1]) : null;
  const last = match[2] ? Number(match[2]) : null;
  if (first !== null && last !== null && first > last) return null;
  return { first, last };
}

function ifRangeMatches(validator, headers) {
  if (validator === null) return true;
  if (validator.startsWith('"')) return validator === headers.get('etag');

  // A date validator must match exactly and be strong enough to trust.
  const modified = headers.get('last-modified');
  const age = Date.parse(headers.get('date') ?? '') - Date.parse(modified ?? '');
  return validator === modified && age >= 60_000;
}

function sliceBody(body, start, length) {
  const reader = body.getReader();
  let skip = start;
  let remaining = length;
  const slice = new ReadableStream({
    async pull(controller) {
      while (remaining > 0) {
        const { value, done } = await reader.read();
        if (done) throw new Error('The asset ended before the requested range.');
        if (skip >= value.byteLength) {
          skip -= value.byteLength;
          continue;
        }

        const chunk = value.subarray(skip, skip + remaining);
        skip = 0;
        remaining -= chunk.byteLength;
        controller.enqueue(chunk);
        if (!remaining) {
          controller.close();
          void reader.cancel().catch(() => {});
        }
        return;
      }
    },
    cancel(reason) { return reader.cancel(reason); },
  });

  // Workers derives Content-Length from fixed-length bodies, not from the header alone.
  const output = new FixedLengthStream(length);
  void slice.pipeTo(output.writable).catch(() => {});
  return output.readable;
}

export default {
  async fetch(request, env) {
    const range = request.method === 'GET' && new URL(request.url).pathname === VIDEO_PATH
      ? parseRange(request.headers.get('range')) : null;
    if (!range) return env.ASSETS.fetch(request);

    const upstreamHeaders = new Headers(request.headers);
    upstreamHeaders.delete('range');
    upstreamHeaders.delete('if-range');
    upstreamHeaders.set('accept-encoding', 'identity');
    const asset = await env.ASSETS.fetch(new Request(request, { headers: upstreamHeaders }));
    const length = asset.headers.get('content-length');
    // The asset binding can omit Content-Length even when the edge sends it.
    // Use the measured size only for the verified media revision.
    const knownRevision = length === null && VERIFIED_VIDEO_ETAGS.has(asset.headers.get('etag'));
    const size = knownRevision ? VERIFIED_VIDEO_LENGTH : /^\d+$/.test(length ?? '') ? Number(length) : NaN;
    const encoding = asset.headers.get('content-encoding');
    if (asset.status !== 200 || !asset.body || !Number.isSafeInteger(size) ||
        (encoding && encoding.toLowerCase() !== 'identity') || !ifRangeMatches(request.headers.get('if-range'), asset.headers)) {
      return asset;
    }

    const start = range.first ?? Math.max(size - range.last, 0);
    const end = range.first === null ? size - 1 : Math.min(range.last ?? size - 1, size - 1);
    const headers = new Headers(asset.headers);
    headers.set('accept-ranges', 'bytes');
    if (start > end) {
      void asset.body.cancel().catch(() => {});
      headers.set('content-range', `bytes */${size}`);
      headers.set('content-length', '0');
      return new Response(null, { status: 416, headers });
    }

    const count = end - start + 1;
    headers.set('content-range', `bytes ${start}-${end}/${size}`);
    headers.set('content-length', String(count));
    return new Response(sliceBody(asset.body, start, count), { status: 206, headers });
  },
};
