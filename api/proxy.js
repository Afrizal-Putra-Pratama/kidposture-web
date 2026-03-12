export default async function handler(req, res) {
  const path = req.url.replace('/api', '');
  const targetUrl = `https://wheezier-unagreed-kizzie.ngrok-free.dev/api${path}`;

  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}