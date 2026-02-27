export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO || 'QED411/bysc-website';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured in Vercel environment variables.' });
  }

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'BYSC-Website-Editor',
  };

  try {
    if (req.method === 'GET') {
      const filePath = req.query.file;
      if (!filePath) return res.status(400).json({ error: 'Missing file parameter' });

      const allowed = ['index.html', 'admin.html', 'gotsport.html', 'coaching.html', 'conduct.html', 'medical.html'];
      if (!allowed.includes(filePath)) {
        return res.status(403).json({ error: 'File not allowed for editing' });
      }

      const response = await fetch(`${apiBase}/contents/${filePath}`, { headers });
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch file from GitHub' });
      }

      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return res.status(200).json({ content, sha: data.sha, path: data.path });
    }

    if (req.method === 'POST') {
      const { file, content, sha, message } = req.body;

      if (!file || !content || !sha) {
        return res.status(400).json({ error: 'Missing file, content, or sha' });
      }

      const allowed = ['index.html', 'admin.html', 'gotsport.html', 'coaching.html', 'conduct.html', 'medical.html'];
      if (!allowed.includes(file)) {
        return res.status(403).json({ error: 'File not allowed for editing' });
      }

      const encoded = Buffer.from(content, 'utf-8').toString('base64');
      const commitMessage = message || `Update ${file} via BYSC Editor`;

      const response = await fetch(`${apiBase}/contents/${file}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: commitMessage,
          content: encoded,
          sha: sha,
          branch: 'master',
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        return res.status(response.status).json({ error: 'Failed to commit', details: errData });
      }

      const result = await response.json();
      return res.status(200).json({
        success: true,
        sha: result.content.sha,
        url: result.content.html_url,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}
