// Vercel serverless proxy for OpenAI API (avoids CORS)
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  // Strip /api/openai prefix to get the OpenAI path
  const openaiPath = url.pathname.replace(/^\/api\/openai/, '') || '/chat/completions';

  const headers = new Headers(req.headers);
  headers.set('Host', 'api.openai.com');
  headers.delete('cookie');

  const response = await fetch(`https://api.openai.com/v1${openaiPath}`, {
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
