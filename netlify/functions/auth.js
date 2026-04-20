const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { username, password } = body;

  if (!username || !password) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: '請輸入帳號和密碼' }) };
  }

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: '帳號或密碼錯誤' }) };
  }

  const payload = `${username}:${Date.now()}`;
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(payload)
    .digest('hex');
  const token = Buffer.from(payload).toString('base64') + '.' + signature;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ token }),
  };
};
