const { getSupabaseClient } = require('./supabase');

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Database not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env, then restart the server.');
  }
  return supabase;
}

function mapListRow(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDetailRow(row) {
  return {
    id: row.id,
    name: row.name,
    data: row.data,
    updatedAt: row.updated_at
  };
}

module.exports = {
  async listByUserId(userId) {
    const supabase = requireClient();
    const { data, error } = await supabase
      .from('training_schedules')
      .select('id, name, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapListRow);
  },

  async findById(userId, scheduleId) {
    const supabase = requireClient();
    const { data, error } = await supabase
      .from('training_schedules')
      .select('id, name, data, updated_at')
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDetailRow(data) : null;
  },

  async create(userId, name) {
    const supabase = requireClient();
    const { data, error } = await supabase
      .from('training_schedules')
      .insert({
        user_id: userId,
        name: name.trim(),
        data: {}
      })
      .select('id, name, created_at, updated_at')
      .single();

    if (error) throw error;
    return mapListRow(data);
  },

  async updateData(userId, scheduleId, scheduleData) {
    const supabase = requireClient();
    const { data, error } = await supabase
      .from('training_schedules')
      .update({ data: scheduleData })
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select('id, name, data, updated_at')
      .single();

    if (error) throw error;
    return mapDetailRow(data);
  },

  async rename(userId, scheduleId, name) {
    const supabase = requireClient();
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Schedule name is required.');

    const { data, error } = await supabase
      .from('training_schedules')
      .update({ name: trimmed })
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select('id, name, created_at, updated_at')
      .single();

    if (error) throw error;
    return mapListRow(data);
  }
};
