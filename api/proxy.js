import { Readable } from 'stream';

// ─── WAJIB: matikan body parser bawaan Vercel ────────────────────────────────
// Tanpa ini, Vercel akan parse body jadi JSON/string dan merusak FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: baca raw body dari request sebagai Buffer
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  const { path } = req.query;

  const targetBase = 'https://wheezier-unagreed-kizzie.ngrok-free.dev/api';
  const targetUrl = `${targetBase}/${Array.isArray(path) ? path.join('/') : path}`;

  // ─── Forward headers yang relevan ────────────────────────────────────────
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    'Accept': req.headers.accept || 'application/json',
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  // ─── Forward Content-Type ASLI dari client ───────────────────────────────
  // Ini krusial untuk multipart/form-data agar boundary ikut terbawa
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }

  const fetchOptions = {
    method: req.method,
    headers,
  };

  // ─── Forward body sebagai raw Buffer (bukan JSON.stringify!) ─────────────
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const rawBody = await getRawBody(req);
    if (rawBody.length > 0) {
      fetchOptions.body = rawBody;
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    // Forward response headers penting
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);

    const disposition = response.headers.get('content-disposition');
    if (disposition) {
      res.setHeader('Content-Disposition', disposition);
    }

    // Handle binary (PDF) maupun JSON — tetap pakai arrayBuffer
    const buffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(buffer));

  } catch (error) {
    res.status(500).json({ message: 'Proxy error', error: error.message });
  }
}