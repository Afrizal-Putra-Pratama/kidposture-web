export default async function handler(req, res) {
  const path = req.url.replace('/storage', '');
  const targetUrl = `https://wheezier-unagreed-kizzie.ngrok-free.dev/storage${path}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    });

    const arrayBuffer = await response.arrayBuffer();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.send(new Uint8Array(arrayBuffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}