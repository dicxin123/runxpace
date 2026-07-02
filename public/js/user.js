function showFlash(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSchedules(schedules) {
  const list = document.getElementById('schedule-list');
  const empty = document.getElementById('empty-state');

  if (!schedules.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = schedules.map((s) => `
    <article class="schedule-card" data-id="${s.id}">
      <div class="schedule-card-main">
        <div class="schedule-name-display">${escapeHtml(s.name)}</div>
        <div class="schedule-meta">Last updated ${formatDate(s.updatedAt)}</div>
        <div class="schedule-rename-row" id="rename-${s.id}">
          <input type="text" value="${escapeHtml(s.name)}" maxlength="120" aria-label="Schedule name" />
          <button type="button" class="btn-primary save-rename-btn" data-id="${s.id}">Save name</button>
          <button type="button" class="btn-secondary cancel-rename-btn" data-id="${s.id}">Cancel</button>
        </div>
      </div>
      <div class="schedule-actions">
        <a href="/schedule/${s.id}" class="btn-primary">Open</a>
        <button type="button" class="btn-secondary rename-btn" data-id="${s.id}">Rename</button>
      </div>
    </article>
  `).join('');
}

async function loadSchedules() {
  const res = await fetch('/user/api/schedules');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load schedules.');
  renderSchedules(data.schedules || []);
}

async function createSchedule() {
  const nameInput = document.getElementById('new-schedule-name');
  const name = nameInput.value.trim() || 'Untitled schedule';

  const res = await fetch('/user/api/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create schedule.');

  window.location.href = `/schedule/${data.schedule.id}`;
}

async function renameSchedule(id, name) {
  const res = await fetch(`/user/api/schedules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to rename schedule.');
  return data.schedule;
}

document.getElementById('new-schedule-btn').addEventListener('click', () => {
  document.getElementById('new-schedule-form').style.display = 'block';
  document.getElementById('new-schedule-name').focus();
});

document.getElementById('cancel-new-btn').addEventListener('click', () => {
  document.getElementById('new-schedule-form').style.display = 'none';
  document.getElementById('new-schedule-name').value = '';
});

document.getElementById('create-schedule-btn').addEventListener('click', async () => {
  try {
    await createSchedule();
  } catch (err) {
    showFlash('flash-error', err.message);
  }
});

document.getElementById('new-schedule-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('create-schedule-btn').click();
});

document.getElementById('schedule-list').addEventListener('click', async (e) => {
  const renameBtn = e.target.closest('.rename-btn');
  if (renameBtn) {
    const row = document.getElementById(`rename-${renameBtn.dataset.id}`);
    row.classList.add('is-open');
    row.querySelector('input').focus();
    return;
  }

  const cancelBtn = e.target.closest('.cancel-rename-btn');
  if (cancelBtn) {
    document.getElementById(`rename-${cancelBtn.dataset.id}`).classList.remove('is-open');
    return;
  }

  const saveBtn = e.target.closest('.save-rename-btn');
  if (saveBtn) {
    const id = saveBtn.dataset.id;
    const row = document.getElementById(`rename-${id}`);
    const name = row.querySelector('input').value.trim();
    if (!name) {
      showFlash('flash-error', 'Schedule name is required.');
      return;
    }
    try {
      await renameSchedule(id, name);
      row.classList.remove('is-open');
      showFlash('flash-success', 'Schedule renamed.');
      await loadSchedules();
    } catch (err) {
      showFlash('flash-error', err.message);
    }
  }
});

fetch('/schedule/api/me')
  .then((r) => r.json())
  .then(({ name }) => {
    document.getElementById('nav-name').textContent = name;
  })
  .catch(() => {});

loadSchedules().catch((err) => showFlash('flash-error', err.message));
