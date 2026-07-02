async function parseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!contentType.includes('application/json')) {
    if (res.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error('Server returned an unexpected response. Redeploy or sign in again.');
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Server returned invalid JSON.');
  }
}
