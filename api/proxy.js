export default async function handler(req, res) {
  const { path } = req.query;
  const targetUrl = `https://posturely.infinityfree.me/api/${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cookie': '__test=c4754fc4c9d5f2a5e0b2c4a9f1d3e7b8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Proxy error', error: error.message });
  }
}