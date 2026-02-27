export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured. The chat feature requires an OpenAI API key in Vercel environment variables.' });
  }

  const { prompt, fileContent, fileName } = req.body;

  if (!prompt || !fileContent || !fileName) {
    return res.status(400).json({ error: 'Missing prompt, fileContent, or fileName' });
  }

  const systemPrompt = `You are a website editor for the Briarcliff Youth Soccer Club (BYSC) website.
You will receive the current HTML content of a file and an instruction from an admin about what to change.

Rules:
- Only modify the specific content the admin asks about. Do not rewrite or restructure unrelated sections.
- Preserve all HTML structure, classes, IDs, and attributes exactly as they are.
- Only change text content, links, or add/remove simple elements as requested.
- Return the COMPLETE updated file content (the full HTML), not just the changed section.
- Do NOT add comments explaining your changes.
- Do NOT change CSS classes, JavaScript, or structural HTML unless explicitly asked.
- Keep the same formatting and indentation style.
- If the instruction is unclear or could break the site, respond with a JSON error instead:
  {"error": "explanation of why this change is risky"}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `File: ${fileName}\n\nInstruction: ${prompt}\n\nCurrent file content:\n\`\`\`html\n${fileContent}\n\`\`\`\n\nReturn the complete updated file. Only output the HTML, nothing else.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({
        error: 'OpenAI API error',
        details: errData.error?.message || 'Unknown error',
      });
    }

    const data = await response.json();
    let updatedContent = data.choices[0]?.message?.content || '';

    const fenceMatch = updatedContent.match(/^```(?:html)?\s*\n([\s\S]*?)\n```\s*$/);
    if (fenceMatch) {
      updatedContent = fenceMatch[1];
    }

    if (updatedContent.startsWith('{') && updatedContent.includes('"error"')) {
      try {
        const errObj = JSON.parse(updatedContent);
        return res.status(400).json({ error: errObj.error });
      } catch (_) {}
    }

    if (!updatedContent.includes('<!DOCTYPE html') && !updatedContent.includes('<html')) {
      return res.status(400).json({ error: 'AI returned invalid output. Please try rephrasing your request.' });
    }

    return res.status(200).json({
      updatedContent,
      model: data.model,
      usage: data.usage,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
