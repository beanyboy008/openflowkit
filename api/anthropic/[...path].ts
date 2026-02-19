// Vercel serverless proxy for Anthropic API (avoids CORS)
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const anthropicPath = url.pathname.replace(/^\/api\/anthropic/, '') || '/messages';

  const headers = new Headers(req.headers);
  headers.set('Host', 'api.anthropic.com');
  headers.delete('cookie');

  const response = await fetch(`https://api.anthropic.com/v1${anthropicPath}`, {
    method: req.method,
    headers,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}
