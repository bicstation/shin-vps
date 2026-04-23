export async function generateArticle(prompt: string): Promise<string> {
  const res = await fetch('/ai-engine/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, priority: 1 }),
  });

  if (!res.ok) {
    throw new Error(`AI API Error: ${res.status}`);
  }

  const data = await res.json();
  return data.content;
}