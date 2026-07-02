const { createClient } = require('@supabase/supabase-js');

let serverClient = null;

function stripQuotes(value) {
  return value.trim().replace(/^["']|["']$/g, '');
}

function normalizeSupabaseUrl(raw) {
  let url = stripQuotes(raw);
  // Common copy-paste mistakes from Supabase dashboard
  url = url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('supabase.co')) {
      console.warn('SUPABASE_URL hostname does not look like a Supabase project URL.');
    }
    return parsed.origin;
  } catch {
    throw new Error(
      `Invalid SUPABASE_URL "${raw}". Use your project URL from Supabase → Settings → API, e.g. https://xxxx.supabase.co`
    );
  }
}

function getSupabaseClient() {
  if (serverClient) return serverClient;

  const rawUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? stripQuotes(process.env.SUPABASE_SERVICE_ROLE_KEY)
    : '';

  if (!rawUrl?.trim() || !serviceKey) {
    console.error('Missing Supabase config. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.');
    return null;
  }

  if (serviceKey === 'your-service-role-key') {
    console.error('SUPABASE_SERVICE_ROLE_KEY is still the placeholder.');
    return null;
  }

  let url;
  try {
    url = normalizeSupabaseUrl(rawUrl);
  } catch (err) {
    console.error(err.message);
    return null;
  }

  serverClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return serverClient;
}

module.exports = { getSupabaseClient };
