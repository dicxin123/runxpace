/**
 * schedule.js — all training schedule logic
 * Extracted from the original single-file HTML app.
 */

const tableBody = document.getElementById('schedule-body');

const scheduleId = window.location.pathname.split('/').filter(Boolean).pop();
if (!scheduleId || scheduleId === 'schedule') {
  window.location.href = '/user';
}

// ─── DOM builders ─────────────────────────────────────────────────────

function createCell(tag, content) {
  const cell = document.createElement(tag);
  cell.innerHTML = content;
  return cell;
}

function createTextarea(name, placeholder = '', value = '') {
  return `<textarea name="${name}" placeholder="${placeholder}">${value}</textarea>`;
}

function createDayCell(weekNumber, dayIndex, value = '') {
  return `<div class="day-cell">
    <span class="day-date-label" data-week="${weekNumber}" data-day="${dayIndex}"></span>
    <div class="day-input" contenteditable="true" data-week="${weekNumber}" data-day="${dayIndex}">${value}</div>
  </div>`;
}

function makeRow(weekNumber) {
  const row = document.createElement('tr');
  row.appendChild(createCell('th', `Week ${weekNumber}`));
  for (let day = 0; day < 7; day += 1) {
    row.appendChild(createCell('td', createDayCell(weekNumber, day)));
  }
  row.appendChild(createCell('td', createTextarea(`week_${weekNumber}_note`, 'Notes for the week')));
  return row;
}

// ─── Week management ───────────────────────────────────────────────────

function addWeek() {
  const weekNumber = tableBody.children.length + 1;
  tableBody.appendChild(makeRow(weekNumber));
  updateDates();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function removeWeek() {
  if (tableBody.children.length <= 1) {
    alert('You must have at least 1 week.');
    return;
  }
  if (confirm('Remove the last week?')) {
    tableBody.removeChild(tableBody.lastChild);
    updateDates();
  }
}

function resetSchedule() {
  if (!confirm('Clear all weeks and start over?')) return;
  tableBody.innerHTML = '';
  addWeek();
}

// ─── Time / pace helpers ───────────────────────────────────────────────

function parseTimeToSeconds(value) {
  const parts = value.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function formatPace(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds - minutes * 60);
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

// ─── Date helpers ──────────────────────────────────────────────────────

function getStartDate() {
  const v = document.getElementById('start-date').value;
  return v ? new Date(v + 'T00:00:00') : null;
}

function getRaceDate() {
  const v = document.getElementById('race-date').value;
  return v ? new Date(v + 'T00:00:00') : null;
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function setStartDateFromManual() {
  const v = document.getElementById('start-date-manual').value.trim();
  if (!v) return;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    document.getElementById('start-date').value = v;
    updateWeeksFromDates();
  } else {
    alert('Please use YYYY-MM-DD format (e.g., 2026-07-01)');
    document.getElementById('start-date-manual').value = '';
  }
}

function syncStartDateToManual() {
  const v = document.getElementById('start-date').value;
  if (v) document.getElementById('start-date-manual').value = v;
}

function setRaceDateFromManual() {
  const v = document.getElementById('race-date-manual').value.trim();
  if (!v) return;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    document.getElementById('race-date').value = v;
    updateWeeksFromDates();
  } else {
    alert('Please use YYYY-MM-DD format (e.g., 2026-08-01)');
    document.getElementById('race-date-manual').value = '';
  }
}

function syncRaceDateToManual() {
  const v = document.getElementById('race-date').value;
  if (v) document.getElementById('race-date-manual').value = v;
}

function calculateWeeksNeeded() {
  const startDate = getStartDate();
  const raceDate = getRaceDate();
  if (!startDate || !raceDate) return 0;
  const mondayOfStart = getMondayOfWeek(startDate);
  const mondayOfRace = getMondayOfWeek(raceDate);
  const diffTime = Math.abs(mondayOfRace - mondayOfStart);
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.max(diffWeeks, 1);
}

function updateWeeksFromDates() {
  const startDate = getStartDate();
  const raceDate = getRaceDate();
  if (!startDate || !raceDate) return;

  const weeksNeeded = calculateWeeksNeeded();
  const currentWeeks = tableBody.children.length;

  if (weeksNeeded > currentWeeks) {
    for (let i = currentWeeks + 1; i <= weeksNeeded; i++) {
      tableBody.appendChild(makeRow(i));
    }
  } else if (weeksNeeded < currentWeeks) {
    while (tableBody.children.length > weeksNeeded) {
      tableBody.removeChild(tableBody.lastChild);
    }
  }

  updateDates();
}

function formatDateLabel(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString(undefined, { month: 'short' });
  return `${day} ${month}`;
}

function updateDates() {
  const startDate = getStartDate();
  document.querySelectorAll('.day-date-label').forEach(label => {
    const week = parseInt(label.dataset.week, 10);
    const day = parseInt(label.dataset.day, 10);
    if (!startDate) { label.textContent = ''; return; }
    const mondayOfStart = getMondayOfWeek(startDate);
    const offsetDays = (week - 1) * 7 + day;
    const currentDate = new Date(mondayOfStart);
    currentDate.setDate(mondayOfStart.getDate() + offsetDays);
    label.textContent = formatDateLabel(currentDate);
  });
}

// ─── Goal info ─────────────────────────────────────────────────────────

function updateGoalInfo() {
  const meters = parseInt(document.getElementById('race-select').value, 10);
  const isHalfOrFull = meters === 21097 || meters === 42195;
  const distanceKm = (meters / 1000).toFixed(isHalfOrFull ? 3 : 1);
  const distanceMiles = (meters / 1609.344).toFixed(isHalfOrFull ? 3 : 2);
  const seconds = parseTimeToSeconds(document.getElementById('goal-time').value);

  let paceKmText = '--:-- /km';
  let paceMilesText = '--:-- /mi';
  if (seconds !== null && seconds > 0) {
    paceKmText = `${formatPace(seconds / (meters / 1000))} /km`;
    paceMilesText = `${formatPace(seconds / (meters / 1609.344))} /mi`;
  }

  document.getElementById('goal-output').textContent =
    `Distance: ${distanceKm} km (${distanceMiles} mi) · Pace: ${paceKmText} (${paceMilesText})`;
}

// ─── Schedule data ─────────────────────────────────────────────────────

function collectScheduleData() {
  return {
    startDate: document.getElementById('start-date').value,
    raceDate: document.getElementById('race-date').value,
    raceTarget: document.getElementById('race-select').value,
    goalTime: document.getElementById('goal-time').value,
    weeks: Array.from(tableBody.children).map((row, rowIndex) => {
      const weekNumber = rowIndex + 1;
      const noteField = row.querySelector(`textarea[name="week_${weekNumber}_note"]`);
      const days = Array.from({ length: 7 }, (_, day) => {
        const dayDiv = row.querySelector(`div[data-week="${weekNumber}"][data-day="${day}"].day-input`);
        return dayDiv ? dayDiv.textContent : '';
      });
      return { week: weekNumber, days, note: noteField ? noteField.value : '' };
    })
  };
}

function applyScheduleData(data) {
  document.getElementById('start-date').value = data.startDate || '';
  document.getElementById('race-date').value = data.raceDate || '';
  document.getElementById('race-select').value = data.raceTarget || '3000';
  document.getElementById('goal-time').value = data.goalTime || '';
  syncStartDateToManual();
  syncRaceDateToManual();

  tableBody.innerHTML = '';
  const weekCount = Math.max((data.weeks || []).length, 1);
  for (let i = 1; i <= weekCount; i += 1) {
    tableBody.appendChild(makeRow(i));
  }

  (data.weeks || []).forEach(weekData => {
    const row = tableBody.children[weekData.week - 1];
    if (!row) return;
    const noteField = row.querySelector('textarea');
    if (noteField) noteField.value = weekData.note || '';
    weekData.days.forEach((value, dayIndex) => {
      const dayDiv = row.querySelector(
        `div[data-week="${weekData.week}"][data-day="${dayIndex}"].day-input`
      );
      if (dayDiv) dayDiv.textContent = value;
    });
  });

  updateGoalInfo();
  updateDates();
}

function showSaveMessage(message) {
  const el = document.getElementById('flash-success');
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

async function saveSchedule() {
  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Saving...';

  try {
    const res = await fetch(`/schedule/api/${scheduleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule: collectScheduleData() })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save schedule.');
    showSaveMessage('Schedule saved.');
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function loadSavedSchedule() {
  try {
    const res = await fetch(`/schedule/api/${scheduleId}`);
    if (!res.ok) {
      if (res.status === 404) window.location.href = '/user';
      return false;
    }
    const { name, schedule } = await res.json();
    const titleEl = document.getElementById('schedule-title');
    if (titleEl && name) titleEl.textContent = name;
    document.title = `${name} · Training Schedule`;

    if (schedule && Object.keys(schedule).length > 0) {
      applyScheduleData(schedule);
      return true;
    }
  } catch (err) {
    console.error('Failed to load saved schedule:', err);
  }
  return false;
}

// ─── Event delegation ──────────────────────────────────────────────────

document.addEventListener('input', event => {
  const t = event.target;
  if (
    t.closest('#schedule-table') ||
    t.id === 'start-date' ||
    t.id === 'race-date' ||
    t.id === 'goal-time' ||
    t.id === 'race-select'
  ) {
    updateDates();
    updateGoalInfo();
  }
});

// ─── Init ──────────────────────────────────────────────────────────────

(async function initSchedule() {
  updateGoalInfo();
  const loaded = await loadSavedSchedule();
  if (!loaded) {
    for (let i = 0; i < 4; i++) addWeek();
    updateDates();
  }
})();
