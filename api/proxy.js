export default async function handler(req, res) {
  const { path } = req.query;
  const targetUrl = `https://posturely.infinityfree.me/api/${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cookie': '__test=f4f482ff9fdedfd9ac27012a76b0229c',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://posturely.infinityfree.me/',
    'Origin': 'https://posturely.infinityfree.me',
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
    const text = await response.text();
    
    // Cek apakah response adalah HTML (anti-bot)
    if (text.includes('aes.js') || text.includes('slowAES')) {
      res.status(503).json({ message: 'Blocked by anti-bot protection' });
      return;
    }

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      res.status(500).json({ message: 'Invalid JSON response', raw: text.substring(0, 200) });
    }
  } catch (error) {
    res.status(500).json({ message: 'Proxy error', error: error.message });
  }
}