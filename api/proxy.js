export default async function handler(req, res) {
  const { path } = req.query;
  
  // Support both ngrok dan infinityfree
  const targetBase = 'https://wheezier-unagreed-kizzie.ngrok-free.dev/api';
  const targetUrl = `${targetBase}/${Array.isArray(path) ? path.join('/') : path}`;

  const headers = {
    'ngrok-skip-browser-warning': 'true',  // ← ini kuncinya
    'Accept': req.headers.accept || 'application/json',
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  const fetchOptions = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(req.body);
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    // Forward semua response headers penting
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType);

    const disposition = response.headers.get('content-disposition');
    if (disposition) {
      res.setHeader('Content-Disposition', disposition);
    }

    // Handle binary (PDF) maupun JSON
    const buffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(buffer));

  } catch (error) {
    res.status(500).json({ message: 'Proxy error', error: error.message });
  }
}