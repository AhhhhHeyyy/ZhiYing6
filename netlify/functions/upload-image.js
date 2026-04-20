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

  let filename, base64Data, category;
  try {
    ({ filename, base64Data, category } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!filename || !base64Data || !category) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: '缺少必要參數' }) };
  }

  // Strip data URL prefix if present (e.g. "data:image/png;base64,")
  const pureBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const ghToken = process.env.GITHUB_TOKEN;

  const categoryFolderMap = {
    installation: 'Installation Art',
    animation: 'Animation',
    painting: 'Painting',
  };
  const folder = categoryFolderMap[category] || category;
  const filePath = `assets/${folder}/${filename}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  const ghHeaders = {
    Authorization: `token ${ghToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Check if file already exists (to get SHA for update)
  let sha;
  const checkRes = await fetch(apiUrl, { headers: ghHeaders });
  if (checkRes.ok) {
    const existing = await checkRes.json();
    sha = existing.sha;
  }

  const body = {
    message: `chore: upload image ${filename} via admin panel`,
    content: pureBase64,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.json();
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: '圖片上傳失敗', detail: err }) };
  }

  const imagePath = `assets/${folder}/${filename}`;

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ success: true, path: imagePath }),
  };
};
