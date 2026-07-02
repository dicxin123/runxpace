const { createClient } = require('@supabase/supabase-js');

let serverClient = null;

function getSupabaseClient() {
  if (serverClient) return serverClient;

  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    console.error('Missing Supabase config. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    return null;
  }

  if (serviceKey === 'your-service-role-key') {
    console.error('SUPABASE_SERVICE_ROLE_KEY is still the placeholder. Update .env with your service role key from Supabase Dashboard → Project Settings → API');
    return null;
  }

  serverClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return serverClient;
}

module.exports = { getSupabaseClient };