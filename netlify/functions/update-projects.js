const crypto = require('crypto');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
};

function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  const payload = Buffer.from(payloadB64, 'base64').toString();
  const expected = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expected) return false;

  const timestamp = parseInt(payload.split(':')[1], 10);
  // Token expires after 24 hours
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return false;

  return true;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;

  if (!verifyToken(token)) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: '未授權，請重新登入' }) };
  }

  let projects;
  try {
    ({ projects } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const ghToken = process.env.GITHUB_TOKEN;
  const filePath = 'projects.json';
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  const ghHeaders = {
    Authorization: `token ${ghToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Get current file SHA
  const getRes = await fetch(apiBase, { headers: ghHeaders });
  if (!getRes.ok) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: '無法讀取 GitHub 上的檔案' }) };
  }
  const { sha } = await getRes.json();

  const content = Buffer.from(JSON.stringify(projects, null, 2) + '\n').toString('base64');

  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify({
      message: 'chore: update projects via admin panel',
      content,
      sha,
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.json();
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: '更新失敗', detail: err }) };
  }

  // Also write a slim projects-nav.json (title + link + order only) used by navigation.js
  // This avoids loading a potentially large projects.json (which may contain base64 images)
  try {
    const navData = {};
    Object.keys(projects).forEach(cat => {
      navData[cat] = (projects[cat] || []).map(({ title, link, order }) => ({ title, link, order }));
    });
    const navContent = Buffer.from(JSON.stringify(navData, null, 2) + '\n').toString('base64');
    const navApiBase = `https://api.github.com/repos/${owner}/${repo}/contents/projects-nav.json`;
    const navGetRes = await fetch(navApiBase, { headers: ghHeaders });
    const navSha = navGetRes.ok ? (await navGetRes.json()).sha : undefined;
    await fetch(navApiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: 'chore: update projects-nav via admin panel',
        content: navContent,
        ...(navSha ? { sha: navSha } : {}),
      }),
    });
  } catch (_) { /* non-critical — navigation.js will fall back gracefully */ }

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ success: true, message: '已更新！Netlify 正在重新部署...' }),
  };
};
