const { getSupabaseClient } = require('./supabase');

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env, then restart the server.');
  }
  return supabase;
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}

module.exports = {
  normalizeName,

  async findByName(name) {
    const supabase = requireClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', normalizeName(name))
      .maybeSingle();

    if (error) throw error;
    return mapRow(data);
  },

  async create({ name, passwordHash }) {
    const supabase = requireClient();
    const { data, error } = await supabase
      .from('users')
      .insert({ name: normalizeName(name), password_hash: passwordHash })
      .select('*')
      .single();

    if (error) throw error;
    return mapRow(data);
  },

  async update(userId, fields) {
    const supabase = requireClient();
    const dbFields = {};
    if (fields.passwordHash !== undefined) dbFields.password_hash = fields.passwordHash;

    const { data, error } = await supabase
      .from('users')
      .update(dbFields)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return mapRow(data);
  }
};
